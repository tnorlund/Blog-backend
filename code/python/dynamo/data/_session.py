import os
import sys
import numpy as np
from botocore.exceptions import ClientError
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import Session, Visit # pylint: disable=wrong-import-position
from dynamo.entities import itemToVisit, itemToSession # pylint: disable=wrong-import-position

class _Session():
  def addSession( self, session ):
    '''Adds a visitor's session to the table.

    Parameters
    ----------
    session : Session
      The visitor's session to be added to the table.

    Returns
    -------
    result : dict
      The result of adding a visitor's session to the table.
    '''
    if not isinstance( session, Session ):
      raise ValueError( 'Must pass a Session object' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = session.toItem(),
        ConditionExpression = 'attribute_not_exists(PK)'
      )
      return { 'session': session }
    except ClientError as e:
      print( f'ERROR addsession: { e }')
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return {
          'error': f'Visitor\'s session is already in table { session }'
        }
      return { 'error': 'Could not add new page visit to table' }

  def removeSession( self, session ):
    '''Removes a session from the table.

    Parameters
    ----------
    session : Session
      The visit to be removed from the table.

    Returns
    -------
    result : dict
      The result of removing the session from the table.
    '''
    if not isinstance( session, Session ):
      raise ValueError( 'Must pass a Session object' )
    try:
      self.client.delete_item(
        TableName = self.tableName,
        Key = session.key(),
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'session': session }
    except ClientError as e:
      print( f'ERROR removeSession: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': f'Session not in table { session }' }
      return { 'error': 'Could not remove session from table' }

  def addNewSession( self, visitor, browsers, visits ):
    '''Adds a new session to the table for the given visitor.

    Parameters
    ----------
    visitor : Visitor
      The returning visitor. They will have their number of sessions
      incremented.
    browsers : list[ Browser ]
      The visitor's browsers to be added to the table.
    visits: list[ Visit ]
      The visits to be added to the table.

    Returns
    -------
    result : dict
      The result of adding a new session for a visitor. This could be either
      the error that occurs or the updated visitor, the browsers added, and the
      visits added to the table.
    '''
    result = self.incrementVisitorSessions( visitor )
    if 'error' in result.keys():
      return { 'error': result['error'] }
    visitor = result['visitor']
    result = self.addBrowsers( browsers )
    if 'error' in result.keys():
      return { 'error': result['error'] }
    # Get all of the seconds per page visit that exist.
    pageTimes = [
      visit.timeOnPage for visit in visits
      if isinstance( visit.timeOnPage, float )
    ]
    # Calculate the average time the visitor spent on the pages. When there are
    # no page times, there is no average time.
    if len( pageTimes ) == 1:
      averageTime = pageTimes[0]
    elif len( pageTimes ) > 1:
      averageTime = np.mean( pageTimes )
    else:
      averageTime = None
    # Calculate the total time spent in this session. When there is only one
    # visit, there is no total time.
    if len( visits ) == 1:
      totalTime = None
    else:
      totalTime = ( visits[-1].date - visits[0].date ).total_seconds()
    session = Session(
      visits[0].date, visits[0].id, averageTime, totalTime
    )
    result = self.addSession( session )
    if 'error' in result.keys():
      return { 'error': result['error'] }
    result = self.addVisits( visits )
    if 'error' in result.keys():
      return { 'error': result['error'] }
    return {
      'visitor': visitor, 'browsers': browsers, 'visits': visits,
      'session': session
    }

  def getSessionDetails( self, session ):
    '''Gets the session and visits from the table.

    Parameters
    ----------
    session : Session
      The session requested from the table.

    Returns
    -------
    data : dict
      The result of getting the session from the table. This contains either
      the error that occurred or the session and its visits.
    '''
    try:
      result = self.client.query(
        TableName = self.tableName,
        IndexName = 'GSI2',
        KeyConditionExpression = '#gsi2 = :gsi2',
        ExpressionAttributeNames = { '#gsi2': 'GSI2PK' },
        ExpressionAttributeValues = { ':gsi2': session.gsi2pk() },
        ScanIndexForward = True
      )
      if len( result['Items'] ) == 0:
        return { 'error': 'Session not in table' }
      data = { 'visits': [] }
      for item in result['Items']:
        if item['Type']['S'] == 'visit':
          data['visits'].append( itemToVisit( item ) )
        elif item['Type']['S'] == 'session':
          data['session'] = itemToSession( item )
      # DynamoDB is limited in 1MB of query results. Continue to query from the
      # 'LastEvaluatedKey' when this condition is met.
      if 'LastEvaluatedKey' in result.keys():
        still_querying = True
        while still_querying:
          result = self.client.query.scan(
            TableName = self.tableName,
            IndexName = 'GSI2',
            KeyConditionExpression = '#gsi2 = :gsi2',
            ExpressionAttributeNames = { '#gsi2': 'GSI2PK' },
            ExpressionAttributeValues = { ':gsi2': session.gsi2pk() },
            ScanIndexForward = True,
            ExclusiveStartKey = result['LastEvaluatedKey']
          )
          for item in result['Items']:
            if item['Type']['S'] == 'visit':
              data['visits'].append( itemToVisit( item ) )
            elif item['Type']['S'] == 'session':
              data['session'] = itemToSession( item )
          if 'LastEvaluatedKey' not in result.keys():
            still_querying = False
      return data
    except ClientError as e:
      print( f'ERROR getSessionDetails: { e }')
      return { 'error': 'Could not get session from table' }

  def updateSession( self, session, visits, print_error = True ):
    '''Updates a session with new visits and attributes.

    Parameters
    ----------
    session : Session
      The session to change the average time on page and the total time on the
      website.
    visits : list[ Visit ]
      All of the visits that belong to the session.
    '''
    if not isinstance( session, Session ):
      raise ValueError( 'Must pass a Session object')
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list of Visit objects' )
    if not all( [
      isinstance( visit, Visit ) for visit in visits
    ] ):
      raise ValueError( 'List of visits must be of Visit type' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = session.toItem(),
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'session': session, 'visits': visits }
    except ClientError as e:
      if print_error:
        print( f'ERROR updateSession: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        print( 'updateSession', session )
        return { 'error': f'Session not in table { session }' }
      return { 'error': 'Could not update session in table' }
