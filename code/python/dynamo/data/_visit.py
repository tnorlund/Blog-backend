import os
import sys
from botocore.exceptions import ClientError
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import Visit # pylint: disable=wrong-import-position
from dynamo.data.util import chunkList # pylint: disable=wrong-import-position

class _Visit():
  def addVisit( self, visit ):
    '''Adds a visitor's page visit to the table.

    Parameters
    ----------
    visit : Visit
      The visitor's page visit to be added to the table.

    Returns
    -------
    result : dict
      The result of adding a visitor's page visit to the table.
    '''
    if not isinstance( visit, Visit ):
      raise ValueError( 'Must pass a Visit object' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = visit.toItem(),
        ConditionExpression = 'attribute_not_exists(PK)'
      )
      return { 'visit': visit }
    except ClientError as e:
      print( f'ERROR addVisit: { e }')
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return {
          'error': f'Visitor\'s page visit is already in table { visit }'
        }
      return { 'error': 'Could not add new page visit to table' }

  def removeVisit( self, visit ):
    '''Removes a visit from the table.

    Parameters
    ----------
    visit : Visit
      The visit to be removed from the table.

    Returns
    -------
    result : dict
      The result of removing the visit from the table.
    '''
    if not isinstance( visit, Visit ):
      raise ValueError( 'Must pass a Visit object' )
    try:
      self.client.delete_item(
        TableName = self.tableName,
        Key = visit.key(),
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'visit': visit }
    except ClientError as e:
      print( f'ERROR removeVisit: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': f'Visit not in table { visit }' }
      return { 'error': 'Could not remove visit from table' }

  def addVisits( self, visits ):
    '''Adds a visitor's page visit to the table.

    Parameters
    ----------
    visits : list[ Visit ]
      The visitor's page visits to be added to the table.

    Returns
    -------
    result : dict
      The result of adding a visitor's page visits to the table.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list' )
    if any( not isinstance( visit, Visit ) for visit in visits ):
      raise ValueError( 'Must pass Visit objects' )
    try:
      if len( visits ) > 25:
        for sub_visits in chunkList( visits, 25 ):
          self.client.batch_write_item(
            RequestItems = {
              self.tableName: [
                { 'PutRequest': { 'Item': visit.toItem() } }
                for visit in sub_visits
              ] },
          )
      else:
        self.client.batch_write_item(
          RequestItems = {
            self.tableName: [
              { 'PutRequest': { 'Item': visit.toItem() } }
              for visit in visits
            ] },
        )
      return { 'visits': visits }
    except ClientError as e:
      print( f'ERROR addVisits: { e }')
      return { 'error': 'Could not add new page visits to table' }

  def updateVisit( self, visit ):
    '''Updates a visit with new attributes.

    Parameters
    ----------
    visit : Visit
      The visit to change the scroll events, previous and next pages, and the
      start time.
    '''
    if not isinstance( visit, Visit ):
      raise ValueError( 'Must pass Visit object' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = visit.toItem,
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'visit': visit }
    except ClientError as e:
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': 'Visit not in table' }
      return { 'error': 'Could not update visit in table' }

  def updateVisits( self, visits ):
    '''Updates visitor's pages with new attributes.

    Parameters
    ----------
    visits : list[ Visits ]
      The visits to updates the scroll events, previous and next pages, and the
      start times.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list' )
    if any( not isinstance( visit, Visit ) for visit in visits ):
      raise ValueError( 'Must pass Visit objects' )
    try:
      if len( visits ) > 25:
        for sub_visits in chunkList( visits, 25 ):
          self.client.batch_write_item(
            RequestItems = {
              self.tableName: [
                { 'PutRequest': { 'Item': visit.toItem() } }
                for visit in sub_visits
              ] },
          )
      else:
        self.client.batch_write_item(
          RequestItems = {
            self.tableName: [
              { 'PutRequest': { 'Item': visit.toItem() } }
              for visit in visits
            ] },
        )
      return { 'visits': visits }
    except ClientError as e:
      print( f'ERROR addVisits: { e }')
      return { 'error': 'Could not add new page visits to table' }
