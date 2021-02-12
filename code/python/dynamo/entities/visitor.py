from .util import toItemException

class Visitor:
  '''A class to represent a visitor item for DynamoDB.

  Attributes
  ----------
  ip : str
    The IP address of the visitor.
  numberSessions : int
    The number of unique the sessions the visitor has made.

  Methods
  -------
  key():
    Returns the Primary Key of the visitor.
  pk():
    Returns the Partition Key of the visitor.
  toItem():
    Returns the visitor as a parsed DynamoDB item.
  '''
  def __init__( self, visitor_id, numberSessions = 0 ):
    '''Constructs the necessary attributes for the visitor object.

    Parameters
    ----------
    ip : str
      The IP address of the visitor.
    numberSessions : int, optional
      The number of unique the sessions the visitor has made. (default is 0)
    '''
    self.id = visitor_id
    self.numberSessions = numberSessions

  def key( self ):
    '''Returns the Primary Key of the visitor.

    This is used to retrieve the unique visitor from the table.
    '''
    return {
      'PK': { 'S': f'VISITOR#{ self.id }' },
      'SK': { 'S': '#VISITOR' }
    }

  def pk( self ):
    '''Returns the Partition Key of the visit.

    This is used to retrieve the visitor-specific data from the table.
    '''
    return { 'S': f'VISITOR#{ self.id }' }

  def toItem( self ):
    """Returns the visitor as a parsed DynamoDB item.

    Returns
    -------
    item : dict
      The visit in DynamoDB syntax.
    """
    return {
      **self.key(),
      'Type': { 'S': 'visitor' },
      'NumberSessions': { 'N': str( self.numberSessions ) }
    }

  def __iter__( self ):
    yield 'id', self.id
    yield 'numberSessions', self.numberSessions

  def __repr__( self ):
    return f"{ self.id } - { self.numberSessions }"

def itemToVisitor( item ):
  '''Parses a DynamoDB item as a visitor object.

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
  visitor : Visitor
    The visitor object parsed from the raw DynamoDB item.
  '''
  try:
    return Visitor(
      item['PK']['S'].split('#')[1],
      int( item['NumberSessions']['N'] )
    )
  except KeyError as e:
    print( f'ERROR itemToVisitor: {e}' )
    raise toItemException( 'visitor' ) from e
