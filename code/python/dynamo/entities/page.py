from .util import objectToItemAtr, toItemException

class Page:
  '''A class to represent a page item for DynamoDB.

  Attributes
  ----------
  slug : str
    The slug of the page visited.
  title : str
    The title of the page visited.
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
    Returns the Primary Key of the page.
  gsi1():
    Returns the Primary Key of the first Global Secondary Index of the page.
  gsi1pk():
    Returns the Partition Key of the first Global Secondary Index of the page.
  toItem():
    Returns the page as a parsed DynamoDB item.
  '''
  def __init__(
    self, slug, title, numberVisitors, averageTime, percentChurn, fromPage,
    toPage
  ):
    '''Constructs the necessary attributes for the page object.

    Parameters
    ----------
    slug : str
      The slug of the page visited.
    title : str
      The title of the page visited.
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
    self.slug = slug
    self.title = title
    self.numberVisitors = int( numberVisitors )
    self.averageTime = float( averageTime ) \
      if averageTime is not None \
      else averageTime
    self.percentChurn = float( percentChurn )
    self.fromPage = fromPage
    self.toPage = toPage

  def key( self ):
    '''Returns the Primary Key of the page.

    This is used to retrieve the unique page from the table.
    '''
    return {
      'PK': { 'S': f'PAGE#{ self.slug }' },
      'SK': { 'S': '#PAGE' }
    }

  def pk( self ):
    '''Returns the Partition Key of the page.

    This is used to retrieve the page-specific data from the table.
    '''
    return { 'S': f'PAGE#{ self.slug }' }

  def gsi1( self ):
    '''Returns the Primary Key of the first Global Secondary Index of the
    page.

    This is used to retrieve the unique page from the table.
    '''
    return {
      'GSI1PK': { 'S': f'PAGE#{ self.slug }' },
      'GSI1SK': { 'S': '#PAGE' }
    }

  def gsi1pk( self ):
    '''Returns the Partition Key of the first Global Secondary Index of the
    visit.

    This is used to retrieve the page-specific data from the table.
    '''
    return { 'S': f'PAGE#{ self.slug }' }

  def toItem( self ):
    '''Returns the visit as a parsed DynamoDB item.

    Returns
    -------
    item : dict
      The visit in DynamoDB syntax.
    '''
    return {
      **self.key(),
      **self.gsi1(),
      'Type': { 'S': 'page' },
      'Title': { 'S': self.title },
      'Slug': { 'S': self.slug },
      'NumberVisitors': objectToItemAtr( self.numberVisitors ),
      'AverageTime': objectToItemAtr( self.averageTime ),
      'PercentChurn': objectToItemAtr( self.percentChurn ),
      'FromPage': objectToItemAtr( self.fromPage ),
      'ToPage': objectToItemAtr( self.toPage )
    }

  def __repr__( self ):
    return f'{ self.title } - { self.percentChurn }'

  def __iter__( self ):
    yield 'slug', self.slug
    yield 'title', self.title
    yield 'numberVisitors', self.numberVisitors
    yield 'averageTime', self.averageTime
    yield 'percentChurn', self.percentChurn
    yield 'fromPage', self.fromPage
    yield 'toPage', self.toPage

def itemToPage( item ):
  '''Parses a DynamoDB item as a page object.

  Parameters
  ----------
  item : dict
    The raw DynamoDB item.

  Raises
  ------
  toItemException
    When the item is missing the required keys to parse into a page object.

  Returns
  -------
  page : Page
    The page object parsed from the raw DynamoDB item.
  '''
  try:
    return Page(
      item['Slug']['S'], item['Title']['S'], item['NumberVisitors']['N'],
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
    print( f'ERROR itemToPage: {e}' )
    raise toItemException( 'page' ) from e
