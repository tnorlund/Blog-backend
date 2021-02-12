import datetime
import numpy as np
from .util import formatDate, objectToItemAtr, toItemException
class Visit:
  """A class to represent a visit item for DynamoDB.

  Attributes
  ----------
  date : datetime.datetime | str
    The datetime the visitor visited this page
  id : str
    The unique ID describing the visitor.
  user : int | str
    The user number of the visitor. If the visitor is not logged in, this
    defaults to 0.
  title : str
    The title of the page visited.
  slug : str
    The slug of the page visited.
  sessionStart : datetime.datetime | str
    The datetime the visitor started at the website. This is used to provide a
    relationship to the visitor's session.
  scroll_events : dict
      The scroll positions over time. This is used to calculate velocity and
      acceleration.
  prevTitle : str | None
    The title of the previous page visited. When this is the first page of the
    session, the value is None.
  prevSlug : str | None
    The slug of the previous page visited.  When this is the first page of the
    session, the value is None.
  nextTitle : str | None
    The title of the next page visited. When this is the last page of the
    session, the value is None.
  nextSlug : str | None
    The slug of the next page visited. When this is the last page of the
    session, the value is None.
  timeOnPage : float | None
    The number of seconds the visitor spent on the page. When this is the last
    page of the session, the value is None.

  Methods
  -------
  key():
    Returns the Primary Key of the visit.
  pk():
    Returns the Partition Key of the visit.
  gsi1():
    Returns the Primary Key of the first Global Secondary Index of the visit.
  gsi1pk():
    Returns the Partition Key of the first Global Secondary Index of the visit.
  gsi2():
    Returns the Primary Key of the second Global Secondary Index of the visit.
  gsi2pk():
    Returns the Partition Key of the second Global Secondary Index of the
    visit.
  toItem():
    Returns the visit as a parsed DynamoDB item.
  """
  def __init__(
    self, visitor_id, date, user, title, slug, sessionStart, scroll_events,
    timeOnPage=None, prevTitle=None, prevSlug=None, nextTitle=None,
    nextSlug=None,
  ):
    '''Constructs the necessary attributes for the visit object.

    Parameters
    ----------
    visitor_id : str
      The unique ID describing the visitor.
    date : datetime.datetime | str
      The datetime the visitor visited this page
    ip : str
      The IP address of the visitor.
    user : int | str
      The user number of the visitor. If the visitor is not logged in, this
      defaults to 0.
    title : str
      The title of the page visited.
    slug : str
      The slug of the page visited.
    sessionStart : datetime.datetime | str
      The datetime the visitor started at the website. This is used to provide a
      relationship to the visitor's session.
    scroll_events : dict
      The scroll positions over time. This is used to calculate velocity and
      acceleration.
    timeOnPage : float | None, optional
      The number of seconds the visitor spent on the page. When this is the last
      page of the session, the value is None. (default is None)
    prevTitle : str | None, optional
      The title of the previous page visited. When this is the first page of the
      session, the value is None. (default is None)
    prevSlug : str | None, optional
      The slug of the previous page visited.  When this is the first page of the
      session, the value is None. (default is None)
    nextTitle : str | None, optional
      The title of the next page visited. When this is the last page of the
      session, the value is None. (default is None)
    nextSlug : str | None, optional
      The slug of the next page visited. When this is the last page of the
      session, the value is None. (default is None)
    '''
    self.date = datetime.datetime.strptime(
      date, '%Y-%m-%dT%H:%M:%S.%fZ'
    ) if isinstance( date, str ) else date
    self.id = visitor_id
    if user == 'None' or user is None:
      self.user = 0
    else:
      self.user = int( user )
    self.title = title
    self.slug = slug
    self.sessionStart = datetime.datetime.strptime(
      sessionStart, '%Y-%m-%dT%H:%M:%S.%fZ'
    ) if isinstance( sessionStart, str ) else sessionStart
    self.scrollEvents = scroll_events
    self.prevTitle = prevTitle
    self.prevSlug = prevSlug
    self.nextTitle = nextTitle
    self.nextSlug = nextSlug
    if str(timeOnPage) == 'nan':
      self.timeOnPage = None
    elif timeOnPage is None:
      self.timeOnPage = timeOnPage
    else:
      self.timeOnPage = float( timeOnPage )

  def key( self ):
    '''Returns the Primary Key of the visit.

    This is used to retrieve the unique visit from the table.
    '''
    return {
      'PK': { 'S': f'VISITOR#{ self.id }' },
      'SK': { 'S': f'VISIT#{ formatDate( self.date ) }#{ self.slug }' }
    }

  def pk( self ):
    '''Returns the Partition Key of the visit.

    This is used to retrieve the visitor-specific data from the table.
    '''
    return { 'S': f'VISITOR#{ self.id }' }

  def gsi1( self ):
    '''Returns the Primary Key of the first Global Secondary Index of the
    visit.

    This is used to retrieve the unique visit from the table.
    '''
    return {
      'GSI1PK': { 'S': f'PAGE#{ self.slug }' },
      'GSI1SK': { 'S': f'VISIT#{ formatDate( self.date ) }' }
    }

  def gsi1pk( self ):
    '''Returns the Partition Key of the first Global Secondary Index of the
    visit.

    This is used to retrieve the page-specific data from the table.
    '''
    return { 'S': f'PAGE#{ self.slug }' }

  def gsi2( self ):
    '''Returns the Primary Key of the second Global Secondary Index of the
    visit.

    This is used to retrieve the unique visit from the table.
    '''
    return {
      'GSI2PK': { 'S': f'''SESSION#{
        self.id
      }#{ formatDate( self.sessionStart ) }''' },
      'GSI2SK': { 'S': f'VISIT#{ formatDate( self.date ) }' }
    }

  def gsi2pk( self ):
    '''Returns the Partition Key of the second Global Secondary Index of the
    visit.

    This is used to retrieve the session-specific data from the table.
    '''
    return { 'S': f'SESSION#{ self.id }#{ formatDate( self.sessionStart ) }' }

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
      **self.gsi2(),
      'Type': { 'S': 'visit' },
      'User': { 'N': f'{self.user}' },
      'Title': { 'S': self.title },
      'Slug': { 'S': self.slug },
      'ScrollEvents': objectToItemAtr( self.scrollEvents ),
      'PreviousTitle': objectToItemAtr( self.prevTitle ),
      'PreviousSlug': objectToItemAtr( self.prevSlug ),
      'NextTitle': objectToItemAtr( self.nextTitle ),
      'NextSlug': objectToItemAtr( self.nextSlug ),
      'TimeOnPage': objectToItemAtr( self.timeOnPage )
    }

  def __repr__( self ):
    return f"{ self.id } - { formatDate( self.date ) }"

  def __iter__( self ):
    yield 'date', self.date
    yield 'id', self.id
    yield 'user', self.user
    yield 'title', self.title
    yield 'slug', self.slug
    yield 'scrollEvents', self.scrollEvents
    yield 'sessionStart', self.sessionStart
    yield 'prevTitle', self.prevTitle
    yield 'prevSlug', self.prevSlug
    yield 'nextTitle', self.nextTitle
    yield 'nextSlug', self.nextSlug
    yield 'timeOnPage', self.timeOnPage

def itemToVisit( item ):
  '''Parses a DynamoDB item as a visit object.

  Parameters
  ----------
  item : dict
    The raw DynamoDB item.

  Raises
  ------
  toItemException
    When the item is missing the required keys to parse into an object.

  Returns
  -------
  visit : Visit
    The visit object parsed from the raw DynamoDB item.
  '''
  try:
    return Visit(
      item['PK']['S'].split('#')[1], item['SK']['S'].split('#')[1],
      int( item['User']['N'] ), item['Title']['S'], item['Slug']['S'],
      item['GSI2PK']['S'].split('#')[2],
      {
        key: {
          'x': int( value['M']['x']['N'] ),
          'y': int( value['M']['y']['N'] )
        }
        for key, value in item['ScrollEvents']['M'].items()
      },
      np.nan
        if 'NULL' in item['TimeOnPage']
        else float( item['TimeOnPage']['N'] ),
      None
        if 'NULL' in item['PreviousTitle'].keys()
        else  item['PreviousTitle']['S'],
      None
        if 'NULL' in item['PreviousSlug'].keys()
        else  item['PreviousSlug']['S'],
      None
        if 'NULL' in item['NextTitle'].keys()
        else  item['NextTitle']['S'],
      None
        if 'NULL' in item['NextSlug'].keys()
        else  item['NextSlug']['S']
    )
  except KeyError as e:
    print( f'ERROR itemToVisit: {e}' )
    raise toItemException( 'visit' ) from e
