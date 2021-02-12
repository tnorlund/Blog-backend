import os
import sys
from botocore.exceptions import ClientError
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import Location, itemToLocation # pylint: disable=wrong-import-position
from dynamo.data.util import chunkList # pylint: disable=wrong-import-position

class _Location:
  def addLocation( self, location ):
    '''Adds the visitor's location to the table.

    Parameters
    ----------
    location : Location
      The visitor's location to be added to the table.

    Returns
    -------
    result : dict
      The result of adding the visitor's location to the table.
    '''
    if not isinstance( location, Location ):
      raise ValueError( 'Must pass a Location object' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = location.toItem(),
        ConditionExpression = 'attribute_not_exists(PK)'
      )
      return { 'location': location }
    except ClientError as e:
      print( f'ERROR addLocation: { e }')
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return {
          'error': f'Visitor\'s location is already in table { location }'
        }
      return { 'error': 'Could not add new location to table' }

  def addLocations( self, locations ):
    '''Adds multiple locations to the table.

    Parameters
    ----------
    locations : list[ Location ]
      The locations to be added to the table.

    Returns
    -------
    result : dict
      The result of adding the locations to the table. This could be the
      locations added or the error that occurred.
    '''
    if not isinstance( locations, list ):
      raise ValueError( 'Must pass a list' )
    if any( not isinstance( location, Location ) for location in locations ):
      raise ValueError( 'Must pass Location objects' )
    try:
      if len( locations ) > 25:
        for sub_locations in chunkList( locations, 25 ):
          self.client.batch_write_item(
            RequestItems = {
              self.tableName: [
                { 'PutRequest': { 'Item': location.toItem() } }
                for location in sub_locations
              ] },
          )
      else:
        self.client.batch_write_item(
          RequestItems = {
            self.tableName: [
              { 'PutRequest': { 'Item': location.toItem() } }
              for location in locations
            ] },
        )
      return { 'locations': locations }
    except ClientError as e:
      print( f'ERROR addLocations: { e }')
      return { 'error': 'Could not add locations to table' }

  def removeLocation( self, location ):
    '''Removes a location from the table.

    Parameters
    ----------
    location : Location
      The location to be removed from the table.

    Returns
    -------
    result : dict
      The result of removing the location from the table.
    '''
    if not isinstance( location, Location ):
      raise ValueError( 'Must pass a Location object' )
    try:
      self.client.delete_item(
        TableName = self.tableName,
        Key = location.key(),
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'location': location }
    except ClientError as e:
      print( f'ERROR removeLocation: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': f'Location not in table { location }' }
      return { 'error': 'Could not remove location from table' }

  def listLocations( self ):
    '''Lists all locations in the table.

    Returns
    -------
    locations : list[ Location ]
      The list of locations from the table.
    '''
    # Use a list to store the locations returned from the table.
    locations = []
    try:
      result = self.client.scan(
        TableName = self.tableName,
        ScanFilter = {
          'Type': {
            'AttributeValueList': [ { 'S': 'location' } ],
            'ComparisonOperator': 'EQ'
          }
        }
      )
      for item in result['Items']:
        locations.append( itemToLocation( item ) )
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
            locations.append( itemToLocation( item ) )
          if 'LastEvaluatedKey' not in result.keys():
            still_querying = False
      return locations
    except ClientError as e:
      print( f'ERROR listLocations: { e }' )
      return { 'error': 'Could not get visits from table' }
