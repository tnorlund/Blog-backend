import os
import sys
import boto3
import numpy as np
from botocore.exceptions import ClientError
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.data._visitor import _Visitor # pylint: disable=wrong-import-position
from dynamo.data._location import _Location # pylint: disable=wrong-import-position
from dynamo.data._session import _Session # pylint: disable=wrong-import-position
from dynamo.data._visit import _Visit # pylint: disable=wrong-import-position
from dynamo.data._browser import _Browser # pylint: disable=wrong-import-position
from dynamo.entities import Visit # pylint: disable=wrong-import-position
from dynamo.entities import Year, Month, Week, Day, Page # pylint: disable=wrong-import-position
from dynamo.entities import itemToVisit # pylint: disable=wrong-import-position
from dynamo.entities import itemToYear, itemToMonth, itemToWeek, itemToDay # pylint: disable=wrong-import-position
from dynamo.entities import itemToPage # pylint: disable=wrong-import-position
from dynamo.data.util import pagesToDict # pylint: disable=wrong-import-position

class DynamoClient( _Visitor, _Location, _Session, _Visit, _Browser ):
  '''A class to represent the DynamoDB client.

  Attributes
  ----------
  client : boto3.client
    The boto3 DynamoDB client used to access the table.
  tableName : str
    The name of the DynamoDB table.
  '''
  def __init__( self, tableName, regionName = 'us-east-1' ):
    '''Constructs the necessary attributes for the DynamoDB client object.

    Parameters
    ----------
    tableName : str
      The name of the DynamoDB table.
    regionName : str
      The AWS region to connect to.
    '''
    self.client = boto3.client( 'dynamodb', region_name = regionName )
    self.tableName = tableName

  def addYear( self, visits ):
    '''Adds a year item to the table.

    Parameters
    ----------
    visits : list[ Visit ]
      The list of visits from a specific year for the specific page.

    Returns
    -------
    result : dict
      The result of adding the year to the table. This could be the error that
      occurs or the year object added to the table.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list' )
    if len( {visit.slug for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same slug' )
    if len( {visit.title for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same title' )
    if len( {visit.date.strftime( '%Y' ) for visit in visits } ) != 1:
      raise ValueError( 'List of visits must be from the same year' )
    # Find all the pages visited before and after this one.
    toPages = [ visit.nextSlug for visit in visits ]
    fromPages = [ visit.prevSlug for visit in visits ]
    # Calculate the average time spent on the page.
    pageTimes = [
      visit.timeOnPage for visit in visits
      if isinstance( visit.timeOnPage, float )
    ]
    if len( pageTimes ) > 1:
      averageTime = np.mean( pageTimes )
    elif len( pageTimes ) == 1:
      averageTime = pageTimes[0]
    else:
      averageTime = None
    # Create the year object
    year = Year(
      visits[0].slug,
      visits[0].title,
      visits[0].date.strftime( '%Y' ),
      len( { visit.id for visit in visits } ),
      averageTime,
      toPages.count( None ) / len( toPages ),
      pagesToDict( fromPages ),
      pagesToDict( toPages )
    )
    try:
      # Add the year to the table
      self.client.put_item( TableName = self.tableName, Item = year.toItem() )
      # Return the year added to the table
      return { 'year': year }
    except ClientError as e:
      print( f'ERROR addYear: { e }' )
      return { 'error': 'Could not add new year to table' }

  def addMonth( self, visits ):
    '''Adds a month item to the table.

    Parameters
    ----------
    visits : list[ Visit ]
      The list of visits from a specific month for the specific page.

    Returns
    -------
    result : dict
      The result of adding the month to the table. This could be the error that
      occurs or the month object added to the table.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list' )
    if len( {visit.slug for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same slug' )
    if len( {visit.title for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same title' )
    if len( {visit.date.strftime( '%Y-%m' ) for visit in visits } ) != 1:
      raise ValueError( 'List of visits must be from the same year and month' )
    # Find all the pages visited before and after this one.
    toPages = [ visit.nextSlug for visit in visits ]
    fromPages = [ visit.prevSlug for visit in visits ]
    # Calculate the average time spent on the page.
    pageTimes = [
      visit.timeOnPage for visit in visits
      if isinstance( visit.timeOnPage, float )
    ]
    if len( pageTimes ) > 1:
      averageTime = np.mean( pageTimes )
    elif len( pageTimes ) == 1:
      averageTime = pageTimes[0]
    else:
      averageTime = None
    # Create the month object
    month = Month(
      visits[0].slug,
      visits[0].title,
      visits[0].date.strftime( '%Y-%m' ),
      len( { visit.id for visit in visits } ),
      averageTime,
      toPages.count( None ) / len( toPages ),
      pagesToDict( fromPages ),
      pagesToDict( toPages )
    )
    try:
      # Add the month to the table
      self.client.put_item( TableName = self.tableName, Item = month.toItem() )
      # Return the month added to the table
      return { 'month': month }
    except ClientError as e:
      print( f'ERROR addMonth: { e }' )
      return { 'error': 'Could not add new month to table' }

  def addWeek( self, visits ):
    '''Adds a week item to the table.

    Parameters
    ----------
    visits : list[ Visit ]
      The list of visits from a specific week for the specific page.

    Returns
    -------
    result : dict
      The result of adding the week to the table. This could be the error that
      occurs or the week object added to the table.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list' )
    if len( {visit.slug for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same slug' )
    if len( {visit.title for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same title' )
    if len( {visit.date.strftime( '%Y-%U' ) for visit in visits } ) != 1:
      raise ValueError( 'List of visits must be from the same year and week' )
    # Find all the pages visited before and after this one.
    toPages = [ visit.nextSlug for visit in visits ]
    fromPages = [ visit.prevSlug for visit in visits ]
    # Calculate the average time spent on the page.
    pageTimes = [
      visit.timeOnPage for visit in visits
      if isinstance( visit.timeOnPage, float )
    ]
    if len( pageTimes ) > 1:
      averageTime = np.mean( pageTimes )
    elif len( pageTimes ) == 1:
      averageTime = pageTimes[0]
    else:
      averageTime = None
    # Create the week object
    week = Week(
      visits[0].slug,
      visits[0].title,
      visits[0].date.strftime( '%Y-%U' ),
      len( { visit.id for visit in visits } ),
      averageTime,
      toPages.count( None ) / len( toPages ),
      pagesToDict( fromPages ),
      pagesToDict( toPages )
    )
    try:
      # Add the week to the table
      self.client.put_item( TableName = self.tableName, Item = week.toItem() )
      # Return the week added to the table
      return { 'week': week }
    except ClientError as e:
      print( f'ERROR addWeek: { e }' )
      return { 'error': 'Could not add new week to table' }

  def addDay( self, visits ):
    '''Adds a day item to the table.

    Parameters
    ----------
    visits : list[ Visit ]
      The list of visits from a specific day for the specific page.

    Returns
    -------
    result : dict
      The result of adding the day to the table. This could be the error that
      occurs or the day object added to the table.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list' )
    if len( {visit.slug for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same slug' )
    if len( {visit.title for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same title' )
    if len( {visit.date.strftime( '%Y-%m-%d' ) for visit in visits } ) != 1:
      raise ValueError(
        'List of visits must be from the same year, month, and day'
      )
    # Find all the pages visited before and after this one.
    toPages = [ visit.nextSlug for visit in visits ]
    fromPages = [ visit.prevSlug for visit in visits ]
    # Calculate the average time spent on the page.
    pageTimes = [
      visit.timeOnPage for visit in visits
      if isinstance( visit.timeOnPage, float )
    ]
    if len( pageTimes ) > 1:
      averageTime = np.mean( pageTimes )
    elif len( pageTimes ) == 1:
      averageTime = pageTimes[0]
    else:
      averageTime = None
    # Create the day object.
    day = Day(
      visits[0].slug,
      visits[0].title,
      visits[0].date.strftime( '%Y-%m-%d' ),
      len( { visit.id for visit in visits } ),
      averageTime,
      toPages.count( None ) / len( toPages ),
      pagesToDict( fromPages ),
      pagesToDict( toPages )
    )
    try:
      # Add the day to the table
      self.client.put_item( TableName = self.tableName, Item = day.toItem() )
      # Return the day added to the table
      return { 'day': day }
    except ClientError as e:
      print( f'ERROR addDay: { e }')
      return { 'error': 'Could not add new day to table' }

  def addPage( self, visits ):
    '''Adds the page item to the table.

    Parameters
    ----------
    visits : list[ Visit ]
      The list of all visits for the specific page.

    Returns
    -------
    result : dict
      The result of adding the page to the table. This could be the error that
      occurs or the page object added to the table.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list' )
    if len( {visit.slug for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same slug' )
    if len( {visit.title for visit in visits } ) != 1:
      raise ValueError( 'List of visits must have the same title' )
    # Find all the pages visited before and after this one.
    toPages = [ visit.nextSlug for visit in visits ]
    fromPages = [ visit.prevSlug for visit in visits ]
    # Calculate the average time spent on the page.
    pageTimes = [
      visit.timeOnPage for visit in visits
      if isinstance( visit.timeOnPage, float )
    ]
    if len( pageTimes ) > 1:
      averageTime = np.mean( pageTimes )
    elif len( pageTimes ) == 1:
      averageTime = pageTimes[0]
    else:
      averageTime = None
    # Create the page object.
    page = Page(
      visits[0].slug,
      visits[0].title,
      len( { visit.id for visit in visits } ),
      averageTime,
      toPages.count( None ) / len( toPages ),
      pagesToDict( fromPages ),
      pagesToDict( toPages )
    )
    try:
      # Add the page to the table
      self.client.put_item( TableName = self.tableName, Item = page.toItem() )
      # Return the page added to the table
      return { 'page': page }
    except ClientError as e:
      print( f'ERROR addPage: { e }')
      return { 'error': 'Could not add new page to table' }

  def updatePage( self, visits ):
    '''Adds the page, and its days/weeks/months/years to the table.

    Parameters
    ----------
    visits : list[ Visit ]
      The specific page's visits that are processed to the page, days, weeks,
      months, and years items.

    Returns
    -------
    results : dict
      The result of adding the new page, days, weeks, months, and years. This
      could be either the error that occurs or the new page, days, weeks,
      months, and years.
    '''
    if not isinstance( visits, list ):
      raise ValueError( 'Must pass a list of Visit objects' )
    if not all( [
      isinstance( visit, Visit ) for visit in visits
    ] ):
      raise ValueError( 'List of visits must be of Visit type' )
    # Add each day's visits
    days = []
    for day_visits in [
      [ visit for visit in visits if visit.date.strftime( '%Y-%m-%d' ) == day ]
      for day in { visit.date.strftime( '%Y-%m-%d' ) for visit in visits }
    ]:
      day_result = self.addDay( day_visits )
      if 'error' in day_result.keys():
        return { 'error': day_result['error'] }
      days.append( day_result['day'] )
    # Add each week's visits
    weeks = []
    for week_visits in [
      [ visit for visit in visits if visit.date.strftime( '%Y-%U' ) == week ]
      for week in { visit.date.strftime( '%Y-%U' ) for visit in visits }
    ]:
      week_result = self.addWeek( week_visits )
      if 'error' in week_result.keys():
        return { 'error': week_result['error'] }
      days.append( week_result['week'] )
    # Add each months's visits
    months = []
    for month_visits in [
      [ visit for visit in visits if visit.date.strftime( '%Y-%m' ) == month ]
      for month in { visit.date.strftime( '%Y-%m' ) for visit in visits }
    ]:
      month_result = self.addMonth( month_visits )
      if 'error' in month_result.keys():
        return { 'error': month_result['error'] }
      months.append( month_result['month'] )
    # Add each years's visits
    years = []
    for year_visits in [
      [ visit for visit in visits if visit.date.strftime( '%Y' ) == year ]
      for year in { visit.date.strftime( '%Y' ) for visit in visits }
    ]:
      year_result = self.addYear( year_visits )
      if 'error' in year_result.keys():
        return { 'error': year_result['error'] }
      years.append( year_result['year'] )
    # Add the page to the table
    page_result = self.addPage( visits )
    if 'error' in page_result.keys():
      return { 'error': page_result['error'] }
    return {
      'page': page_result['page'], 'days': days, 'weeks': weeks,
      'months': months, 'years': years
    }

  def getPageDetails( self, page ):
    '''Gets a page and its days, weeks, months, and years of analytics.

    Parameters
    ----------
    page : Page
      The page to request the details of.

    Raises
    ------
    Exception
      When the items returned by the query are not either a visit, session,
      page, day, week, month, or year.
    KeyError
      When the items returned are not structured as expected
    ClientError
      When the DynamoDB client raises an exception.

    Returns
    -------
    result : dict
      The result of requesting the page from the table. This contains either the
      error that occurred or the page's analytics.
    '''
    if not isinstance( page, ( Page, Visit ) ):
      raise ValueError( 'Must pass a Page object' )
    try:
      result = self.client.query(
        TableName = self.tableName,
        IndexName = 'GSI1',
        KeyConditionExpression = '#gsi1 = :gsi1',
        ExpressionAttributeNames = { '#gsi1': 'GSI1PK' },
        ExpressionAttributeValues = { ':gsi1': page.gsi1pk() },
        ScanIndexForward = True
      )
      # Return the error when there are no items returned from the table.
      if len( result['Items'] ) == 0:
        return { 'error': 'Page not in table' }
      # Use a dictionary to store the items returned from the table
      data = {
        'visits': [], 'days': [], 'weeks': [], 'months': [], 'years': []
      }
      data = _parsePageDetails( data, result )
      # DynamoDB is limited in 1MB of query results. Continue to query from the
      # 'LastEvaluatedKey' when this condition is met.
      if 'LastEvaluatedKey' in result.keys():
        still_querying = True
        while still_querying:
          result = self.client.query(
            TableName = self.tableName,
            IndexName = 'GSI1',
            KeyConditionExpression = '#gsi1 = :gsi1',
            ExpressionAttributeNames = { '#gsi1': 'GSI1PK' },
            ExpressionAttributeValues = { ':gsi1': page.gsi1pk() },
            ScanIndexForward = True,
            ExclusiveStartKey = result['LastEvaluatedKey']
          )
          data = _parsePageDetails( data, result )
          if 'LastEvaluatedKey' not in result.keys():
            still_querying = False
      return data
    except ClientError as e:
      print( f'ERROR getPageDetails: { e }')
      return { 'error': 'Could not get page from table' }

def _parsePageDetails( data, result ):
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
    if item['Type']['S'] == 'visit':
      data['visits'].append( itemToVisit( item ) )
    elif item['Type']['S'] == 'page':
      data['page'] = itemToPage( item )
    elif item['Type']['S'] == 'day':
      data['days'].append( itemToDay( item ) )
    elif item['Type']['S'] == 'week':
      data['weeks'].append( itemToWeek( item ) )
    elif item['Type']['S'] == 'month':
      data['months'].append( itemToMonth( item ) )
    elif item['Type']['S'] == 'year':
      data['years'].append( itemToYear( item ) )
  return data
