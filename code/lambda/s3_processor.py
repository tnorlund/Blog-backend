import os
import json
import datetime
import urllib.parse
import boto3
import numpy as np
from dynamo.data import S3Client, DynamoClient
from dynamo.processing import processDF
from dynamo.entities import Visitor, Session, Visit

def s3_processor(event, context):
  new = 0
  updated = 0
  additional = 0
  # Get the necessary data from the S3 event.
  key = urllib.parse.unquote_plus(
    event['Records'][0]['s3']['object']['key'], encoding='utf-8'
  )
  aws_region = event['Records'][0]['awsRegion']
  bucket_name = event['Records'][0]['s3']['bucket']['name']
  # Create the necessary clients
  dynamo_client = DynamoClient( os.environ['TABLE_NAME'], aws_region )
  s3_client = S3Client( bucket_name, aws_region )
  # Parse the record to get the browsers, visits, and session.
  record = processDF( key, s3_client )
  # Get the visitor from the table
  visitor_details = dynamo_client.getVisitorDetails( 
    Visitor( record['session'].id ) 
  )
  # Add the visitor, visits, session, and browsers if the visitor is not in 
  # the table.
  if not 'visitor' in visitor_details:
    dynamo_client.addVisitor( Visitor( record['session'].id ) )
    dynamo_client.addSession( record['session'] )
    dynamo_client.addVisits( record['visits'] )
    dynamo_client.addBrowsers( record['browsers'] ) 
    new += 1
  # Check to see if the last session can be combined with the one in this
  # record.
  else:
    last_session = visitor_details['sessions'][-1]
    last_sessions_visits = [ 
      visit for visit in visitor_details['visits'] 
      if visit.sessionStart == last_session.sessionStart
    ]
    # Combine the visits and update the session when the last session was
    # less than 30 minutes from this record,
    if (
      (
        last_sessions_visits[-1].date - record['visits'][0].date
      ).total_seconds() < 60 * 30
    ):
      # Update all of the record's with the previous session start
      for visit in record['visits']:
        visit.sessionStart = last_session.sessionStart
      # Update the last visit of the last session when the first visit of
      # the record is the last page visited in the previous session.
      if ( last_sessions_visits[-1].title == record['visits'][0].title ):
        updated_visit = Visit(
          last_sessions_visits[-1].id, # visitor_id 
          last_sessions_visits[-1].date, # date 
          last_sessions_visits[-1].user, # user 
          last_sessions_visits[-1].title, # title
          last_sessions_visits[-1].slug, # slug
          last_sessions_visits[-1].sessionStart, # sessionStart 
          {
            **last_sessions_visits[-1].scrollEvents,
            **record['visits'][0].scrollEvents
          }, # scrollEvents
          (
            # The total time on the updated page is the last scroll
            # event on the record's first visit minus the first 
            # scroll event of the last visit of the session to 
            # update.
            datetime.datetime.strptime(
              list( 
                record['visits'][0].scrollEvents.keys()
              )[-1],
              '%Y-%m-%dT%H:%M:%S.%fZ'
            ) - datetime.datetime.strptime(
              list(
                last_sessions_visits[-1].scrollEvents.keys()
              )[0],
              '%Y-%m-%dT%H:%M:%S.%fZ'
            )
          ).total_seconds(), #timeOnPage 
          last_sessions_visits[-1].prevTitle, # prevTitle
          last_sessions_visits[-1].prevSlug, # prevSlug
          record['visits'][0].nextTitle, # nextTitle
          record['visits'][0].nextSlug # nextSlug
        )
        visits_to_update = [ updated_visit ] + record['visits'][1:] + \
          last_sessions_visits[:-1]
      else:
        visits_to_update = record['visits'] + last_sessions_visits
      # Update all of the visits in the record to have the session
      dynamo_client.updateVisits( visits_to_update )
      dynamo_client.addBrowsers( record['browsers'] ) 
      dynamo_client.updateSession(
        Session( 
          last_session.sessionStart, # Start date-time
          last_session.id, # Visitor ID
          np.mean( [
            visit.timeOnPage for visit in visits_to_update
          ] ), # avgTime
          np.sum( [
            visit.timeOnPage for visit in visits_to_update
          ] ) # totalTime
        ),
        []
      )
      updated += 1
    # Add a the new session, visits, and browsers when the last session was
    # more than 30 minutes from this record.
    else: 
      dynamo_client.addSession( record['session'] )
      dynamo_client.addVisits( record['visits'] )
      dynamo_client.addBrowsers( record['browsers'] ) 
      additional += 1
  
  return {
    'statusCode': 200,
    'body': json.dumps(f'updated { updated }\nnew { new }\nadditional {additional}')
  }
