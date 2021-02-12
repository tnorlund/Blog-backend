import json
import os
import sys
import io
import datetime
import numpy as np
import pandas as pd
import pyarrow # pylint: disable=unused-import
import urllib3
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.processing import processDF, processVisits # pylint: disable=wrong-import-position
from dynamo.entities import Visitor, Session # pylint: disable=wrong-import-position
from dynamo.entities import requestToLocation # pylint: disable=wrong-import-position

http = urllib3.PoolManager()

def processParquet( key, dynamo_client, s3_client ):
  '''Adds the data from a '.parquet' file to the DynamoDB table.

  Parameters
  ----------
  key : str
    The key of the '.parquet' file in the S3 bucket.
  dynamo_client : DynamoClient
    The DynamoDB client used to store the transformed data.
  s3_client : S3Client
    The S3 client used to get the '.parquet' file from.
  '''
  try:
    request = s3_client.getObject( key )
    # Read the parquet file as a pandas DF
    df = pd.read_parquet( io.BytesIO( request['Body'].read() ) )
    # Get the unique IP addresses
    ips = df['ip'].unique()
    # Iterate over the IP addresses to organize the DF's per visitor
    for ip in ips:
      # Get the visitor details from the table.
      visitor_details = dynamo_client.getVisitorDetails( Visitor( ip ) )
      # Get the browsers and visits of the specific IP address.
      visitor_dict = processDF( df, ip )
      # When the visitor is not found in the database, the visitor, location,
      # browser, session, and visits must be added to the database.
      if 'error' in visitor_details.keys() \
        and visitor_details['error'] == 'Visitor not in table':
        # Add the new visitor and their data to the table
        _createNewVisitor(
          ip, visitor_dict['browsers'], visitor_dict['visits'], dynamo_client
        )
      # Otherwise, determine whether to add a new session, update a visitor's
      # session, or combine multiple sessions.
      else:
        # Skip the session when the session is already in the table.
        if Session(
          visitor_dict['visits'][0].date, ip, 0, 0
        ).key() in [ session.key() for session in visitor_details['sessions'] ]:
          continue
        # Calculate the time deltas of the different sessions and the visitor's
        # first visit.
        time_deltas = [
          (
            visitor_dict['visits'][0].date - \
            session.sessionStart + \
            datetime.timedelta( seconds=session.totalTime ) \
              if session.totalTime is not None \
              else visitor_dict['visits'][0].date - session.sessionStart
          )
          for session in visitor_details['sessions']
        ]
        # Find all sessions that have the timedelta of less than 30 minutes on
        # the same day.
        sessions_to_update = [
          visitor_details['sessions'][index]
          for index in range( len( time_deltas ) )
          if time_deltas[index].days < 1 and time_deltas[index].days >= 0
          and time_deltas[index].seconds / ( 60 * 60 ) < 0.5
          and time_deltas[index].seconds > 0
        ]
        # Update the visitor's session when only 1 session is found to be
        # within the timedelta.
        if len( sessions_to_update ) == 1:
          _updateSession(
            sessions_to_update[0], visitor_dict['visits'], dynamo_client
          )
        elif len( sessions_to_update ) > 1:
          _updateSessions(
            sessions_to_update, visitor_dict['visits'], dynamo_client
          )
        # Create a new session when the time between the last session and the
        # first of these visits is greater than 30 minutes.
        else:
          _addSessionToVisitor(
            ip, visitor_dict['visits'], visitor_dict['browsers'], dynamo_client
          )
  except Exception as e:
    print( f'ERROR processParquet { e }' )
    print(
      f'Error getting object { key } from bucket { s3_client.bucketname }.' + \
        ' Make sure they exist and your bucket is in the same region as ' + \
        'this function.'
    )
    raise e

def _createNewVisitor( ip, browsers, visits, dynamo_client ):
  '''Adds new Visitor data from a visitor-specific DataFrame to the table.

  Parameters
  ----------
  ip : str
    The IP address of the visitor.
  v_df : pd.DataFrame
    The visitor-specific DataFrame that holds the session's data.
  dynamo_client : DynamoClient
    The DynamoDB client used to access the table

  Returns
  -------
  result : dict
    The result of adding the new visitor and their data to the table. This
    could be new visitor, location, browser, session, and visits added or the
    error that occurred.
  '''
  result = dynamo_client.addNewVisitor(
    Visitor( ip, 1 ), # Visitor
    requestToLocation( json.loads(
      http.request(
        'GET',
        f'''https://geo.ipify.org/api/v1?apiKey={ os.environ.get('IPIFY_KEY')
        }&ipAddress={ ip }'''
      ).data.decode( 'utf8' )
    ) ), # Location
    browsers, # Browsers
    visits # Visits
  )
  if 'error' in result.keys():
    print( 'ERROR _createNewSession ' + result['error'] )
  return result

def _addSessionToVisitor( ip, visits, browsers, dynamo_client ):
  '''Creates a new Session with the data from a visitor-specific DataFrame.

  Parameters
  ----------
  ip : str
    The IP address of the visitor.
  v_df : pd.DataFrame
    The visitor-specific DataFrame that holds the session's data.
  dynamo_client : DynamoClient
    The DynamoDB client used to access the table.
  visits : list[ Visit ]
    The list of visits found in the parquet file.

  Returns
  -------
  result : dict
    The result of adding the new visitor and their data to the table. This
    could be new visitor, location, browser, session, and visits added or the
    error that occurred.
  '''
  result = dynamo_client.addNewSession(
    Visitor( ip ), # Visitor
    browsers, # Browsers
    visits # Visits
  )
  if 'error' in result.keys():
    print( 'ERROR _addSessionToVisitor ' + result['error'] )
  return result

def _updateSessions( oldSessions, visits, dynamo_client ):
  '''Updates multiple sessions and visits to be a single session.

  Parameters
  ----------
  oldSessions : list[ Session ]
    The old sessions that have been found to be close enough to be combined
    into a single session.
  visits : list[ Visit ]
    The visits found in the '.parquet' file. These are combined with the visits
    in the other sessions.
  dynamo_client : DynamoClient
    The DynamoDB client used to access the table.

  Returns
  -------
  result : dict
    The result of combining the sessions and updating the visits in the table.
    These could be the updated session and visits or the error that occurred
    while accessing the table.
  '''
  # Create a list of all of the visits from the old sessions.
  old_visits = []
  for session in oldSessions:
    session_details = dynamo_client.getSessionDetails( session )
    if 'error' in session_details.keys():
      return { 'error': session_details['error'] }
    old_visits += session_details['visits']
  # Remove the unnecessary sessions from the table.
  for session in oldSessions[1:]:
    dynamo_client.removeSession( session )
    dynamo_client.decrementVisitorSessions( Visitor( session.ip ) )
  # The visits must be combined and assigned the correct attributes before
  # adding them to the table. Combine the previous visits with the ones in the
  # last session and reassign their attributes.
  combined_visits = processVisits( visits + old_visits )
  # Update the previous session to have the attributes with the new
  # visits.
  oldSessions[0].avgTime = np.mean( [
    visit.timeOnPage for visit in combined_visits
    if isinstance( visit.timeOnPage, float )
  ] )
  oldSessions[0].totalTime = (
    combined_visits[-1].date - combined_visits[0].date
  ).total_seconds()
  # Add the updated session and visits to the table.
  result = dynamo_client.updateSession( oldSessions[0], combined_visits )
  if 'error' in result.keys():
    print( 'ERROR _updateSession ' + result['error'] )
  return result

def _updateSession( lastSession, visits, dynamo_client ):
  '''Updates the latest session with recent visits.

  Parameters
  ----------
  lastSession : Session
    The visitor's latest session returned from the database. This is used to
    update with the visits found in this '.parquet' file.
  visits : list[ Visit ]
    The visits found in this '.parquet' file. These are added to the latest
    session and then added to the table.
  dynamo_client : DynamoClient
    The DynamoDB client used to access the table.

  Returns
  -------
  result : dict
    The result of adding the updated session to the table. This could be the
    updated session or the error that occurs while updating the session.
  '''
  session_details = dynamo_client.getSessionDetails( lastSession )
  if 'error' in session_details.keys():
    return { 'error': session_details['error'] }
  # The visits must be combined and assigned the correct attributes before
  # adding them to the table. Combine the previous visits with the ones in the
  # last session and reassign their attributes.
  combined_visits = processVisits( visits + session_details['visits'] )
  # Update the previous session to have the attributes with the new
  # visits.
  session_details['session'].avgTime = np.mean( [
    visit.timeOnPage for visit in combined_visits
    if isinstance( visit.timeOnPage, float )
  ] )
  session_details['session'].totalTime = (
    combined_visits[-1].date - combined_visits[0].date
  ).total_seconds()
  # Add the updated session and visits to the table.
  result = dynamo_client.updateSession(
    session_details['session'], combined_visits, False
  )
  return result
