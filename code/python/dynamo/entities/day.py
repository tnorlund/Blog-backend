import re
from .util import objectToItemAtr, toItemException

class Day:
  '''A class to represent a day item for DynamoDB.

  Attributes
  ----------
  slug : str
    The slug of the page visited.
  title : str
    The title of the page visited.
  year: int
    The year the page was visited.
  month : int
    The month, represented as a number, the page was visited.
  day : int
    The day of the month the page was visited.
  numberVisitors : int
    The number of page's unique visitors.
  averageTime : float
    The average number of time spent on the page until going to another page
    on the website.
  percentChurn : float
    The percentage of the visitors that churned on this page rather than
    continuing to visit other pages.
  fromPage : dict
    The different pages the visitors came from and their ratios.
  toPage : dict
    The different pages the visitors when to and their ratios.

  Methods
  -------
  key():
    Returns the Primary Key of the day.
  gsi1():
    Returns the Primary Key of the first Global Secondary Index of the day.
  gsi1pk():
    Returns the Partition Key of the first Global Secondary Index of the day.
  toItem():
    Returns the day as a parsed DynamoDB item.
  '''
  def __init__(
    self, slug, title, date, numberVisitors, averageTime,
    percentChurn, fromPage, toPage
  ):
    '''Constructs the necessary attributes for the day object.

    Parameters
    ----------
    slug : str
      The slug of the page visited.
    title : str
      The title of the page visited.
    date : str
      The day's date in the format "<year>-<month>-<day>".
    numberVisitors : int
      The number of page's unique visitors.
    averageTime : float
      The average number of time spent on the page until going to another page
      on the website.
    percentChurn : float
      The percentage of the visitors that churned on this page rather than
      continuing to visit other pages.
    fromPage : dict
      The different pages the visitors came from and their ratios.
    toPage : dict
      The different pages the visitors when to and their ratios.
    '''
    dateMatch = re.match( r'(\d+)-(\d+)-(\d+)', date )
    if not dateMatch:
      raise ValueError( 'Must give day as "<year>-<month>-<day>"' )
    if len( dateMatch.group( 1 ) ) != 4:
      raise ValueError( 'Must give valid year' )
    if int( dateMatch.group( 2 ) ) < 1 or int( dateMatch.group(2) ) > 12:
      raise ValueError( 'Must give valid month' )
    if int( dateMatch.group( 3 ) ) < 1 or int( dateMatch.group(3) ) > 31:
      raise ValueError( 'Must give valid day of the month' )
    self.slug = slug
    self.title = title
    self.year = int( dateMatch.group( 1 ) )
    self.month = int( dateMatch.group( 2 ) )
    self.day = int( dateMatch.group( 3 ) )
    self.numberVisitors = int( numberVisitors )
    self.averageTime = float( averageTime ) \
      if averageTime is not None \
      else averageTime
    self.percentChurn = float( percentChurn )
    self.fromPage = fromPage
    self.toPage = toPage

  def key( self ):
    '''Returns the Primary Key of the day.

    This is used to retrieve the unique day from the table.
    '''
    return {
      'PK': { 'S': f'PAGE#{ self.slug }' },
      'SK': {
        'S': f'''#DAY#{
            self.year
          }-{
            str( self.month ).zfill( 2 )
          }-{ str( self.day ).zfill( 2 ) }'''
      }
    }

  def pk( self ):
    '''Returns the Partition Key of the day.

    This is used to retrieve the page-specific data from the table.
    '''
    return { 'S': f'PAGE#{ self.slug }' }

  def gsi1( self ):
    '''Returns the Primary Key of the first Global Secondary Index of the
    day.

    This is used to retrieve the unique day from the table.
    '''
    return {
      'GSI1PK': { 'S': f'PAGE#{ self.slug }' },
      'GSI1SK': {
        'S': f'''#DAY#{
          self.year
        }-{
          str( self.month ).zfill( 2 )
        }-{ str( self.day ).zfill( 2 ) }'''
      }
    }

  def gsi1pk( self ):
    '''Returns the Partition Key of the first Global Secondary Index of the
    visit.

    This is used to retrieve the page-specific data from the table.
    '''
    return { 'S': f'PAGE#{ self.slug }' }

  def toItem( self ):
    '''Returns the day as a parsed DynamoDB item.

    Returns
    -------
    item : dict
      The day in DynamoDB syntax.
    '''
    return {
      **self.key(),
      **self.gsi1(),
      'Type': { 'S': 'day' },
      'Title': { 'S': self.title },
      'Slug': { 'S': self.slug },
      'NumberVisitors': objectToItemAtr( self.numberVisitors ),
      'AverageTime': objectToItemAtr( self.averageTime ),
      'PercentChurn': objectToItemAtr( self.percentChurn ),
      'FromPage': objectToItemAtr( self.fromPage ),
      'ToPage': objectToItemAtr( self.toPage )
    }

  def __repr__( self ):
    return f'''{
      self.title
    } - {
      self.year
    }/{
      str( self.month ).zfill( 2 )
    }/{
      str( self.day ).zfill( 2 )
    }'''

  def __iter__( self ):
    yield 'slug', self.slug
    yield 'title', self.title
    yield 'year', self.year
    yield 'month', self.month
    yield 'day', self.day
    yield 'numberVisitors', self.numberVisitors
    yield 'averageTime', self.averageTime
    yield 'percentChurn', self.percentChurn
    yield 'fromPage', self.fromPage
    yield 'toPage', self.toPage

def itemToDay( item ):
  '''Parses a DynamoDB item as a day object.

  Parameters
  ----------
  item : dict
    The raw DynamoDB item.

  Raises
  ------
  toItemException
    When the item is missing the required keys to parse into a day object.

  Returns
  -------
  day : Day
    The day object parsed from the raw DynamoDB item.
  '''
  try:
    return Day(
      item['Slug']['S'], item['Title']['S'], item['SK']['S'].split('#')[2],
      item['NumberVisitors']['N'],
      None if 'NULL' in item['AverageTime'].keys() \
        else item['AverageTime']['N'],
      item['PercentChurn']['N'],
      {
        key: float( value['N'] )
        for (key, value) in item['FromPage']['M'].items()
        if 'N' in value.keys()
      },
      {
        key: float( value['N'] )
        for (key, value) in item['ToPage']['M'].items()
        if 'N' in value.keys()
      }
    )
  except Exception as e:
    print( f'ERROR itemToDay: {e}' )
    raise toItemException( 'day' ) from e
