import os
import sys
from botocore.exceptions import ClientError
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import Browser # pylint: disable=wrong-import-position

class _Browser():
  def addBrowser( self, browser ):
    '''Adds a browser to the table.

    Parameters
    ----------
    browser : Browser
      The visitor's browser to be added to the table.

    Returns
    -------
    result : dict
      The result of adding a visitor's browser to the table.
    '''
    if not isinstance( browser, Browser ):
      raise ValueError( 'Must pass a Browser object' )
    try:
      self.client.put_item(
        TableName = self.tableName,
        Item = browser.toItem(),
        ConditionExpression = 'attribute_not_exists(PK)'
      )
      return { 'browser': browser }
    except ClientError as e:
      print( f'ERROR addBrowser: { e }')
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return {
          'error': f'Visitor\'s browser is already in table { browser }'
        }
      return { 'error': 'Could not add new browser to table' }

  def removeBrowser( self, browser ):
    '''Removes a browser from the table.

    Parameters
    ----------
    browser : Browser
      The browser to be removed from the table.

    Returns
    -------
    result : dict
      The result of removing the browser from the table.
    '''
    if not isinstance( browser, Browser ):
      raise ValueError( 'Must pass a Browser object' )
    try:
      self.client.delete_item(
        TableName = self.tableName,
        Key = browser.key(),
        ConditionExpression = 'attribute_exists(PK)'
      )
      return { 'browser': browser }
    except ClientError as e:
      print( f'ERROR removeBrowser: { e }' )
      if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
        return { 'error': f'Browser not in table { browser }' }
      return { 'error': 'Could not remove browser from table' }

  def addBrowsers( self, browsers ):
    '''Adds browsers to the table.

    Parameters
    ----------
    browsers : list[ Browser ]
      The browsers to be added to the table.

    Returns
    -------
    result : dict
      The result of adding browsers to the table.
    '''
    if not isinstance( browsers, list ):
      raise ValueError( 'Must pass a list' )
    if any( not isinstance( browser, Browser ) for browser in browsers ):
      raise ValueError( 'Must pass Browser objects' )
    try:
      self.client.batch_write_item(
        RequestItems = {
          self.tableName: [
            { 'PutRequest': { 'Item': browser.toItem() } }
            for browser in browsers
          ] },
      )
      return { 'browsers': browsers }
    except ClientError as e:
      print( f'ERROR addBrowsers: { e }')
      return { 'error': 'Could not add new browsers to table' }
