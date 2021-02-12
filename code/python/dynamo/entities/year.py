from .util import objectToItemAtr, toItemException

class Year:
  '''A class to represent a year item for DynamoDB.

  Attributes
  ----------
  slug : str
    The slug of the page visited.
  title : str
    The title of the page visited.
  year : int
    The year of the visits.
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
    Returns the Primary Key of the year.
  pk():
    Returns the Partition Key of the year.
  gsi1():
    Returns the Primary Key of the first Global Secondary Index of the year.
  gsi1pk():
    Returns the Partition Key of the first Global Secondary Index of the year.
  toItem():
    Returns the year as a parsed DynamoDB item.
  '''
  def __init__(
    self, slug, title, year, numberVisitors, averageTime,
    percentChurn, fromPage, toPage
  ):
    '''Constructs the necessary attributes for the year object.

    Parameters
    ----------
    slug : str
      The slug of the page visited.
    title : str
      The title of the page visited.
    year : str
      The year of the visits.
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
    if len( str( year ) ) != 4:
      raise ValueError( 'Must give valid year' )
    self.slug = slug
    self.title = title
    self.year = int( year )
    self.numberVisitors = int( numberVisitors )
    self.averageTime = float( averageTime ) \
      if averageTime is not None \
      else averageTime
    self.percentChurn = float( percentChurn )
    self.fromPage = fromPage
    self.toPage = toPage

  def key( self ):
    '''Returns the Primary Key of the year.

    This is used to retrieve the unique year from the table.
    '''
    return {
      'PK': { 'S': f'PAGE#{ self.slug }' },
      'SK': { 'S': f'#YEAR#{ self.year }' }
    }

  def pk( self ):
    '''Returns the Partition Key of the year.

    This is used to retrieve the page-specific data from the table.
    '''
    return { 'S': f'PAGE#{ self.slug }' }

  def gsi1( self ):
    '''Returns the Primary Key of the first Global Secondary Index of the
    day.

    This is used to retrieve the unique year from the table.
    '''
    return {
      'GSI1PK': { 'S': f'PAGE#{ self.slug }' },
      'GSI1SK': {
        'S': f'#YEAR#{ self.year }'
      }
    }

  def gsi1pk( self ):
    '''Returns the Partition Key of the first Global Secondary Index of the
    visit.

    This is used to retrieve the page-specific data from the table.
    '''
    return { 'S': f'PAGE#{ self.slug }' }

  def toItem( self ):
    '''Returns the year as a parsed DynamoDB item.

    Returns
    -------
    item : dict
      The year in DynamoDB syntax.
    '''
    return {
      **self.key(),
      **self.gsi1(),
      'Type': { 'S': 'year' },
      'Title': { 'S': self.title },
      'Slug': { 'S': self.slug },
      'NumberVisitors': objectToItemAtr( self.numberVisitors ),
      'AverageTime': objectToItemAtr( self.averageTime ),
      'PercentChurn': objectToItemAtr( self.percentChurn ),
      'FromPage': objectToItemAtr( self.fromPage ),
      'ToPage': objectToItemAtr( self.toPage )
    }

  def __repr__( self ):
    return f'{ self.title } - { self.year }'

  def __iter__( self ):
    yield 'slug', self.slug
    yield 'title', self.title
    yield 'year', self.year
    yield 'numberVisitors', self.numberVisitors
    yield 'averageTime', self.averageTime
    yield 'percentChurn', self.percentChurn
    yield 'fromPage', self.fromPage
    yield 'toPage', self.toPage

def itemToYear( item ):
  '''Parses a DynamoDB item as a year object.

  Parameters
  ----------
  item : dict
    The raw DynamoDB item.

  Raises
  ------
  toItemException
    When the item is missing the required keys to parse into a year object.

  Returns
  -------
  year : Year
    The year object parsed from the raw DynamoDB item.
  '''
  try:
    return Year(
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
    print( f'ERROR itemToYear: {e}' )
    raise toItemException( 'year' ) from e
