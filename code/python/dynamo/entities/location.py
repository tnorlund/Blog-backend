import datetime
from .util import objectToItemAtr, formatDate, toItemException

class Location:
  '''A class to represent the visitor's location item for DynamoDB.

  Attributes
  ----------
  ip : str
    The IP address of the visitor.
  country : str
    The country the IP address is associated with.
  region : str
    The region the IP address is associated with. When the IP is located in the
    US, the region is the state.
  city : str
    The city the IP address is associated with.
  latitude : float
    The latitude the IP address is associated with.
  longitude : float
    The longitude the IP address is associated with.
  postalCode : str
    The postal code the IP address is associated with.
  timezone : str
    The time zone the IP address is associated with.
  domains : list[ str ]
    The domains the IP address is associated with.
  autonomousSystem : dict
    The routing data the IP address is associated with.
  isp : str
    The Internet service provider the IP address is associated with.
  proxy : bool
    Whether the IP address is used as a proxy.
  vpn : bool
    Whether the IP address is a VPN endpoint.
  tor : bool
    Whether the IP address is a TOR endpoint.
  dateAdded : datetime.datetime
    The datetime the location was added to the table.

  Methods
  -------
  key():
    Returns the Primary Key of the location.
  pk():
    Returns the Partition Key of the location.
  toItem():
    Returns the location as a parsed DynamoDB item.
  '''
  def __init__(
    self, visitor_id, ip, country, region, city, latitude, longitude,
    postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor,
    dateAdded = datetime.datetime.now()
  ):
    '''Constructs the necessary attributes for the location object.

    Parameters
    ----------
    ip : str
      The IP address of the visitor.
    country : str
      The country the IP address is associated with.
    region : str
      The region the IP address is associated with. When the IP is located in
      the US, the region is the state.
    city : str
      The city the IP address is associated with.
    latitude : float
      The latitude the IP address is associated with.
    longitude : float
      The longitude the IP address is associated with.
    postalCode : str
      The postal code the IP address is associated with.
    timezone : str
      The time zone the IP address is associated with.
    domains : list[ str ]
      The domains the IP address is associated with.
    autonomousSystem : dict
      The routing data the IP address is associated with.
    isp : str
      The Internet service provider the IP address is associated with.
    proxy : bool
      Whether the IP address is used as a proxy.
    vpn : bool
      Whether the IP address is a VPN endpoint.
    tor : bool
      Whether the IP address is a TOR endpoint.
    dateAdded : datetime.datetime
      The datetime the location was added to the table.
    '''
    self.id = visitor_id
    self.ip = ip
    self.country = country
    self.region = region
    self.city = city
    self.latitude = latitude
    self.longitude = longitude
    self.postalCode = postalCode if postalCode != '' else None
    self.timeZone = timezone
    self.domains = domains
    self.autonomousSystem = autonomousSystem
    self.isp = isp
    self.proxy = proxy
    self.vpn = vpn
    self.tor = tor
    self.dateAdded = dateAdded \
      if isinstance( dateAdded, datetime.datetime ) \
      else datetime.datetime.strptime(
        dateAdded, '%Y-%m-%dT%H:%M:%S.%fZ'
      )

  def key( self ):
    '''Returns the Primary Key of the location.

    This is used to retrieve the unique session from the table.
    '''
    return {
      'PK': { 'S': f'VISITOR#{ self.id }' },
      'SK': { 'S': '#LOCATION' }
    }

  def pk( self ):
    '''Returns the Partition Key of the location.

    This is used to retrieve the visitor-specific data from the table.
    '''
    return { 'S': f'VISITOR#{ self.id }' }

  def toItem( self ):
    '''Returns the location as a parsed DynamoDB item.

    Returns
    -------
    item : dict
      The location in DynamoDB syntax.
    '''
    return {
      **self.key(),
      'Type': { 'S': 'location' },
      'IP': { 'S': self.ip },
      'Country': { 'S': self.country },
      'Region': { 'S': self.region },
      'City': { 'S': self.city },
      'Latitude': { 'N': str( self.latitude ) },
      'Longitude': { 'N': str( self.longitude ) },
      'PostalCode': objectToItemAtr( self.postalCode ),
      'TimeZone': { 'S': self.timeZone },
      'Domains': objectToItemAtr( self.domains ),
      'AutonomousSystem': objectToItemAtr( self.autonomousSystem ),
      'ISP': { 'S': self.isp },
      'Proxy': { 'BOOL': self.proxy },
      'VPN': { 'BOOL': self.vpn },
      'TOR': { 'BOOL': self.tor },
      'DateAdded': { 'S': formatDate( self.dateAdded ) }
    }

  def __repr__( self ):
    return f"{ self.id } - { self.city }"

  def __iter__( self ):
    yield 'id', self.id
    yield 'ip', self.ip
    yield 'country', self.country
    yield 'region', self.region
    yield 'city', self.city
    yield 'lat', self.latitude
    yield 'lng', self.longitude
    yield 'postalCode', self.postalCode
    yield 'timezone', self.timeZone
    yield 'domains', self.domains
    yield 'as', self.autonomousSystem
    yield 'isp', self.isp
    yield 'proxy', self.proxy
    yield 'vpn', self.vpn
    yield 'tor', self.tor
    yield 'dateAdded', self.dateAdded

def requestToLocation( req, visitor_id ):
  '''Parses the JSON formatted GET request ipify gives.

  ipify gives IP Geolocation and IP Proxy data based on the visitor's IP
  address. This request is then used to store in the DynamoDB table.
  The (API)[https://www.ipify.org] has great documentation and is easy to use.

  Parameters
  ----------
  req : dict
    The result of the ipify GET request.

  Raises
  ------
  toItemException
    When the item is missing the required keys to parse into an object.

  Returns
  -------
  location : Location
    The location object parsed from the ipify GET request.
  '''
  try:
    return Location(
      visitor_id, req['ip'], req['location']['country'],
      req['location']['region'], req['location']['city'],
      req['location']['lat'], req['location']['lng'],
      req['location']['postalCode'], req['location']['timezone'],
      None if 'domains' not in req.keys() else req['domains'],
      req['as'] if 'as' in req else None, req['isp'],
      req['proxy']['proxy'], req['proxy']['vpn'], req['proxy']['tor']
    )
  except KeyError as e:
    print( f'ERROR requestToLocation: {e}' )
    raise toItemException( 'location' ) from e

def itemToLocation( item ):
  '''Parses a DynamoDB item as a location object.

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
  location : Location
    The location object parsed from the raw DynamoDB item.
  '''
  try:
    return Location(
      item['PK']['S'].split('#')[1],
      item['IP']['S'],
      item['Country']['S'], item['Region']['S'],
      item['City']['S'], float( item['Latitude']['N'] ),
      float( item['Longitude']['N'] ),
      None if 'NULL' in item['PostalCode'].keys() else item['PostalCode']['S'],
      item['TimeZone']['S'],
      None if 'NULL' in item['Domains'].keys() else item['Domains']['SS'],
      {
        **{
          key: int( value['N'] )
          for (key, value) in item['AutonomousSystem']['M'].items()
          if 'N' in value.keys()
        },
        **{
          key: value['S']
          for (key, value) in item['AutonomousSystem']['M'].items()
          if 'S' in value.keys()
        },
        **{
          key: None
          for (key, value) in item['AutonomousSystem']['M'].items()
          if 'NULL' in value.keys()
        }
      },
      item['ISP']['S'], item['Proxy']['BOOL'], item['VPN']['BOOL'],
      item['TOR']['BOOL'],
      datetime.datetime.strptime(
        item['DateAdded']['S'], '%Y-%m-%dT%H:%M:%S.%fZ'
      )
    )
  except KeyError as e:
    print( f'ERROR itemToLocation: {e}' )
    raise toItemException( 'location' ) from e
