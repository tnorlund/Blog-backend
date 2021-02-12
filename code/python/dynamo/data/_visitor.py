import os
import sys
import numpy as np
from botocore.exceptions import ClientError
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import Visitor, Session # pylint: disable=wrong-import-position
from dynamo.entities import itemToVisitor, itemToVisit, itemToSession # pylint: disable=wrong-import-position
from dynamo.entities import itemToLocation, itemToBrowser # pylint: disable=wrong-import-position

class _Visitor:
  def addVisitor( self, visitor ):
    '''Adds a visitor to the table.

    Parameters
    ----------
    visitor : Visitor
      The visitor to be added to the table.

    Returns
    -------
    result : dict
      The result of adding the visitor to the table.
    '''
    if not isinstance( visitor, Visitor ):
      raise ValueError( 'Must pass a Visitor object' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = visitor.toItem(),
        ConditionExpression = 'attribute_not_exists(PK)'
      )
      return { 'visitor': visitor }
    except ClientError as e:
      print( f'ERROR addVisitor: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': f'Visitor already in table { visitor }' }
      return { 'error': 'Could not add new visitor to table' }

  def updateVisitor( self, visitor ):
    '''Updates a visitor in the table.

    Parameters
    ----------
    visitor : Visitor
      The visitor to be updated in the table.

    Returns
    -------
    result : dict
      The result of updating the visitor to the table.
    '''
    if not isinstance( visitor, Visitor ):
      raise ValueError( 'Must pass a Visitor object' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = visitor.toItem(),
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'visitor': visitor }
    except ClientError as e:
      print( f'ERROR updateVisitor: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': f'Visitor not in table { visitor }' }
      return { 'error': 'Could not update visitor in table' }

  def addNewVisitor( self, visitor, location, browsers, visits ):
    '''Adds a new visitor and their details the the table.

    Parameters
    ----------
    visitor : Visitor
      The visitor to be added to the table.
    location : Location
      The visitor's location to be added to the table.
    browsers : list[ Browser ]
      The visitor's browsers to be added to the table.
    visits : list[ Visit ]
      The visits to be added to the table.

    Returns
    -------
    result : dict
      The result of adding the visitor and their attributes to the table.
    '''
    result = self.addVisitor( visitor )
    if 'error' in result.keys():
      return { 'error': result['error'] }
    result = self.addLocation( location )
    if 'error' in result.keys():
      return { 'error': result['error'] }
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
      totalTime = np.sum( [ visit.timeOnPage for visit in visits ] )
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
      'visitor': visitor, 'location': location, 'browsers': browsers,
      'visits': visits, 'session': session
    }

  def removeVisitor( self, visitor ):
    '''Removes a visitor from the table.

    Parameters
    ----------
    visitor : Visitor
      The visitor to be removed from the table.

    Returns
    -------
    result : dict
      The result of removing the visitor from the table.
    '''
    if not isinstance( visitor, Visitor ):
      raise ValueError( 'Must pass a Visitor object' )
    try:
      self.client.delete_item(
        TableName = self.tableName,
        Key = visitor.key(),
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'visitor': visitor }
    except ClientError as e:
      print( f'ERROR removeVisitor: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': f'Visitor not in table { visitor }' }
      return { 'error': 'Could not remove visitor from table' }

  def incrementVisitorSessions( self, visitor ):
    '''Increments the number of sessions a visitor has.

    Parameters
    ----------
    visitor : Visitor
      The visitor to have their number of sessions incremented.

    Returns
    -------
    result : dict
      The result of incrementing the number of sessions the visitor has. This
      could be either an error or the updated visitor.
    '''
    if not isinstance( visitor, Visitor ):
      raise ValueError( 'Must pass a Visitor object' )
    try:
      result = self.client.update_item(
        TableName = self.tableName,
        Key = visitor.key(),
        ConditionExpression = 'attribute_exists(PK)',
        UpdateExpression= 'SET #count = #count + :inc',
        ExpressionAttributeNames = { '#count': 'NumberSessions' },
        ExpressionAttributeValues= { ':inc': { 'N': '1' } },
        ReturnValues= 'ALL_NEW'
      )
      visitor.numberSessions = int(
        result['Attributes']['NumberSessions']['N']
      )
      return { 'visitor': visitor }
    except ClientError as e:
      print( f'ERROR incrementVisitorSessions: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': 'Visitor not in table' }
      return {
        'error': 'Could not increment the number of sessions of visitor'
      }

  def decrementVisitorSessions( self, visitor ):
    '''Decrements the number of sessions a visitor has.

    Parameters
    ----------
    visitor : Visitor
      The visitor to have their number of sessions incremented.

    Returns
    -------
    result : dict
      The result of decrementing the number of sessions the visitor has. This
      could be either an error or the updated visitor.
    '''
    if not isinstance( visitor, Visitor ):
      raise ValueError( 'Must pass a Visitor object' )
    try:
      result = self.client.update_item(
        TableName = self.tableName,
        Key = visitor.key(),
        ConditionExpression = 'attribute_exists(PK)',
        UpdateExpression= 'SET #count = #count - :dec',
        ExpressionAttributeNames = { '#count': 'NumberSessions' },
        ExpressionAttributeValues= { ':dec': { 'N': '1' } },
        ReturnValues= 'ALL_NEW'
      )
      visitor.numberSessions = int(
        result['Attributes']['NumberSessions']['N']
      )
      return { 'visitor': visitor }
    except ClientError as e:
      print( f'ERROR decrementVisitorSessions: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': 'Visitor not in table' }
      return {
        'error': 'Could not decrement the number of sessions of visitor'
      }

  def getVisitorDetails( self, visitor ):
    '''Gets the visitor and their details from the table.

    Parameters
    ----------
    visitor : Visitor
      The visitor to request from the table.

    Returns
    -------
    result : dict
      The result of requesting the visitor from the table. This contains either
      the error that occurred or the visitor's details.
    '''
    if not isinstance( visitor, Visitor ):
      raise ValueError( 'Must pass a Visitor object' )
    try:
      result = self.client.query(
        TableName = self.tableName,
        KeyConditionExpression = '#pk = :pk',
        ExpressionAttributeNames = { '#pk': 'PK' },
        ExpressionAttributeValues = { ':pk': visitor.pk() },
        ScanIndexForward = True
      )
      # Return the error when there are no items returned from the table.
      if len( result['Items'] ) == 0:
        return { 'error': 'Visitor not in table' }
      # Use a dictionary to store the items returned from the table
      data = { 'visits': [], 'browsers': [], 'sessions': [] }
      data = _parseVisitorDetails( data, result )
      # DynamoDB is limited in 1MB of query results. Continue to query from the
      # 'LastEvaluatedKey' when this condition is met.
      if 'LastEvaluatedKey' in result.keys():
        still_querying = True
        while still_querying:
          result = self.client.query(
            TableName = self.tableName,
            KeyConditionExpression = '#pk = :pk',
            ExpressionAttributeNames = { '#pk': 'PK' },
            ExpressionAttributeValues = { ':pk': visitor.pk() },
            ScanIndexForward = True,
            ExclusiveStartKey = result['LastEvaluatedKey']
          )
          data = _parseVisitorDetails( data, result )
          if 'LastEvaluatedKey' in result.keys():
            still_querying = False
      return data
    except ClientError as e:
      print( f'ERROR getVisitorDetails: { e }')
      return { 'error': 'Could not get visitor from table' }

  def listVisitors( self ):
    '''Lists all visitors in the table.

    Returns
    -------
    visitors : list[ Visitor ]
      The list of visitors from the table.
    '''
    # Use a list to store the locations returned from the table.
    visitors = []
    try:
      result = self.client.scan(
        TableName = self.tableName,
        ScanFilter = {
          'Type': {
            'AttributeValueList': [ { 'S': 'visitor' } ],
            'ComparisonOperator': 'EQ'
          }
        }
      )
      for item in result['Items']:
        visitors.append( itemToVisitor( item ) )
      # DynamoDB is limited in 1MB of query results. Continue to query from the
      # 'LastEvaluatedKey' when this condition is met.
      if 'LastEvaluatedKey' in result.keys():
        still_querying = True
        while still_querying:
          result = self.client.scan(
            TableName = self.tableName,
            ScanFilter = {
              'Type': {
                'AttributeValueList': [ { 'S': 'location' } ],
                'ComparisonOperator': 'EQ'
              }
            },
            ExclusiveStartKey = result['LastEvaluatedKey']
          )
          for item in result['Items']:
            visitors.append( itemToVisitor( item ) )
          if 'LastEvaluatedKey' not in result.keys():
            still_querying = False
      return visitors
    except ClientError as e:
      print( f'ERROR listVisitors: { e }' )
      return { 'error': 'Could not get visitors from table' }

def _parseVisitorDetails( data, result ):
  '''Parses the DynamoDB items to their respective objects.

  Parameters
  ----------
  data : dict
    The parsed data as a dictionary.
  result : dict
    The result of the DynamoDB query.

  Returns
  data : dict
    The original parsed data combined with the new parsed data.
  '''
  for item in result['Items']:
    if item['Type']['S'] == 'visitor':
      data['visitor'] = itemToVisitor( item )
    elif item['Type']['S'] == 'visit':
      data['visits'].append( itemToVisit( item ) )
    elif item['Type']['S'] == 'session':
      data['sessions'].append( itemToSession( item ) )
    elif item['Type']['S'] == 'location':
      data['location'] = itemToLocation( item )
    elif item['Type']['S'] == 'browser':
      data['browsers'].append( itemToBrowser( item ) )
  return data
