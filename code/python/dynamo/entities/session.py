import datetime
from .util import formatDate, toItemException, objectToItemAtr

class Session:
  """A class to represent a visitor's session item for DynamoDB.

  Attributes
  ----------
  sessionStart : datetime.datetime | str
    The datetime the visitor started at the website. This is used to provide a
    relationship to the visitor's session.
  ip : str
    The IP address of the visitor.
  avgTime : float
    The average number of seconds the visitor spent on a page.
  totalTime : float
    The total amount of time the user spent on the website.

  Methods
  -------
  key():
    Returns the Primary Key of the session.
  pk():
    Returns the Partition Key of the session.
  gsi2():
    Returns the Primary Key of the second Global Secondary Index of the
    session.
  gsi2pk():
    Returns the Partition Key of the second Global Secondary Index of the
    session.
  toItem():
    Returns the session as a parsed DynamoDB item.
  """
  def __init__(
    self, sessionStart, visitor_id, avgTime, totalTime
  ):
    '''Constructs the necessary attributes for the session object.

    Parameters
    ----------
    sessionStart : datetime.datetime | str
      The datetime the visitor started at the website. This is used to provide a
      relationship to the visitor's session.
    ip : str
      The IP address of the visitor.
    avgTime : float
      The average number of seconds the visitor spent on a page.
    totalTime : float
      The total amount of time the user spent on the website.
    '''
    self.sessionStart = sessionStart \
      if isinstance( sessionStart, datetime.datetime ) \
      else datetime.datetime.strptime(
        sessionStart, '%Y-%m-%dT%H:%M:%S.%fZ'
      )
    self.id = visitor_id
    self.avgTime = float( avgTime ) if avgTime is not None else avgTime
    self.totalTime = float( totalTime ) if totalTime is not None else totalTime

  def key( self ):
    '''Returns the Primary Key of the session.

    This is used to retrieve the unique session from the table.
    '''
    return {
      'PK': { 'S': f'VISITOR#{ self.id }' },
      'SK': { 'S': f'SESSION#{ formatDate( self.sessionStart ) }' }
    }

  def pk( self ):
    '''Returns the Partition Key of the session.

    This is used to retrieve the visitor-specific data from the table.
    '''
    return { 'S': f'VISITOR#{ self.id }' }

  def gsi2( self ):
    '''Returns the Primary Key of the second Global Secondary Index of the
    session.

    This is used to retrieve the unique session from the table.
    '''
    return {
      'GSI2PK': { 'S': f'''SESSION#{
        self.id
      }#{ formatDate( self.sessionStart ) }''' },
      'GSI2SK': { 'S': '#SESSION' }
    }

  def gsi2pk( self ):
    '''Returns the Partition Key of the second Global Secondary Index of the
    session.

    This is used to retrieve the session-specific data from the table.
    '''
    return { 'S': f'''SESSION#{
      self.id
    }#{ formatDate( self.sessionStart ) }''' }

  def toItem( self ):
    '''Returns the session as a parsed DynamoDB item.

    Returns
    -------
    item : dict
      The session in DynamoDB syntax.
    '''
    return {
      **self.key(),
      **self.gsi2(),
      'Type': { 'S': 'session' },
      'AverageTime': objectToItemAtr( self.avgTime ),
      'TotalTime': objectToItemAtr( self.totalTime )
    }

  def __repr__( self ):
    return f'{ self.id } - { self.totalTime }'

  def __iter__( self ):
    yield 'sessionStart', self.sessionStart
    yield 'id', self.id
    yield 'avgTime', self.avgTime
    yield 'totalTime', self.totalTime

def itemToSession( item ):
  '''Parses a DynamoDB item as a session object.

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
  session : Session
    The session object parsed from the raw DynamoDB item.
  '''
  try:
    return Session(
      datetime.datetime.strptime(
        item['SK']['S'].split('#')[1], '%Y-%m-%dT%H:%M:%S.%fZ'
      ),
      item['PK']['S'].split('#')[1],
      None if 'NULL' in item['AverageTime'].keys() \
        else float( item['AverageTime']['N'] ),
      None if 'NULL' in item['TotalTime'].keys() \
        else float( item['TotalTime']['N'] )
    )
  except KeyError as e:
    print( f'ERROR itemToSession: {e}' )
    raise toItemException( 'session' ) from e
