import re
import datetime
from .util import objectToItemAtr, formatDate, toItemException

class Browser:
  '''A class to represent a browser item for DynamoDB.

  Attributes
  ----------
  app : str
    The browser's userAgent.
  ip :
    The IP address of the visitor.
  width : int
    The width of the browser window in points.
  height : int
    The height of the browser window in points.
  dateVisited : datetime.datetime | str
    The datetime the browser was used to visit the website.
  device : str
    The device used to access the browser. This is typically the name of the
    phone or computer used.
  deviceType : str
    The type of device used to access the browser. This is either a desktop
    or mobile phone.
  browser : str
    The name of the browser used to access the website.
  os : str
    The name of the operating system used to the access the website.
  webkit : str
    The webkit version used in the browser.
  version : str
    The version number of the browser.
  dateAdded : datetime.datetime | str
    The datetime the browser was added to the table.

  Methods
  -------
  key():
    Returns the Primary Key of the browser.
  pk():
    Returns the Partition Key of the browser.
  toItem():
    Returns the browser as a parsed DynamoDB item.
  '''
  def __init__(
    self, visitor_id, app, width, height, dateVisited, device = None,
    deviceType = None, browser = None, os = None,  webkit = None,
    version = None, dateAdded = datetime.datetime.now()
  ):
    '''Constructs the necessary attributes for the browser object.

    Parameters
    ----------
    app : str
      The browser's userAgent.
    ip :
      The IP address of the visitor.
    width : int
      The width of the browser window in points.
    height : int
      The height of the browser window in points.
    dateVisited : datetime.datetime | str
      The datetime the browser was used to visit the website.
    device : str
      The device used to access the browser. This is typically the name of the
      phone or computer used.
    deviceType : str
      The type of device used to access the browser. This is either a desktop
      or mobile phone.
    browser : str
      The name of the browser used to access the website.
    os : str
      The name of the operating system used to the access the website.
    webkit : str
      The webkit version used in the browser.
    version : str
      The version number of the browser.
    dateAdded : datetime.datetime | str
      The datetime the browser was added to the table.
    '''
    self.id = visitor_id
    self.app = app
    self.width = int( width )
    self.height = int( height )
    self.dateVisited = dateVisited \
      if isinstance( dateVisited, datetime.datetime ) \
      else datetime.datetime.strptime(
        dateVisited, '%Y-%m-%dT%H:%M:%S.%fZ'
      )
    self.dateAdded = dateAdded \
      if isinstance( dateAdded, datetime.datetime ) \
      else datetime.datetime.strptime(
        dateAdded, '%Y-%m-%dT%H:%M:%S.%fZ'
      )
    # self.dateAdded = dateAdded
    matched = self._matchMac()
    if not matched:
      matched = self._matchWindows()
    if not matched:
      matched = self._matchiPhone()
    if not matched:
      matched = self._matchAndroid()
    if not matched:
      self.app = app
      self.device = device
      self.deviceType = deviceType
      self.browser = browser
      self.os = os
      self.webkit = webkit
      self.version = version
      self.id = visitor_id
      self.dateAdded = dateAdded

  def key( self ):
    '''Returns the Primary Key of the browser.

    This is used to retrieve the unique browser from the table.
    '''
    return( {
      'PK': { 'S': f'VISITOR#{ self.id }' },
      'SK': { 'S': f'BROWSER#{ formatDate( self.dateVisited ) }' }
    } )

  def pk( self ):
    '''Returns the Partition Key of the browser.

    This is used to retrieve the visitor-specific data from the table.
    '''
    return { 'S': f'VISITOR#{ self.id }' }

  def toItem( self ):
    '''Returns the browser as a parsed DynamoDB item.

    Returns
    -------
    item : dict
      The browser in DynamoDB syntax.
    '''
    return( {
      **self.key(),
      'Type': { 'S': 'browser' },
      'App': objectToItemAtr( self.app ),
      'Width': objectToItemAtr( self.width ),
      'Height': objectToItemAtr( self.height ),
      'DateVisited': {'S': formatDate( self.dateVisited ) },
      'Device': objectToItemAtr( self.device ),
      'DeviceType': objectToItemAtr( self.deviceType ),
      'Browser': objectToItemAtr( self.browser ),
      'OS': objectToItemAtr( self.os ),
      'Webkit': objectToItemAtr( self.webkit ),
      'Version': objectToItemAtr( self.version ),
      'DateAdded': objectToItemAtr( formatDate( self.dateAdded ) )
    } )

  def __repr__( self ):
    return f"{ self.id } - { self.browser }"

  def __iter__( self ):
    yield 'app', self.app
    yield 'id', self.id
    yield 'dateVisited', self.dateVisited
    yield 'width', self.width
    yield 'height', self.height
    yield 'device', self.device
    yield 'deviceType', self.deviceType
    yield 'browser', self.browser
    yield 'os', self.os
    yield 'webkit', self.webkit
    yield 'version', self.version
    yield 'dateAdded', self.dateAdded

  def _matchMac( self ):
    # Mac - Safari
    safari_match = re.match(
      r"Mozilla\/5\.0 \(Macintosh; Intel Mac OS X (\d+_\d+_\d+)\) " + \
      r"AppleWebKit\/(\d+\.\d+\.\d+) \(KHTML, like Gecko\) Version\/" + \
      r"(\d+\.\d+\.\d+) Safari\/(\d+\.\d+\.\d+)",
      self.app
    )
    # Mac - Chrome
    chrome_match = re.match(
      r"Mozilla\/5\.0 \(Macintosh; Intel Mac OS X (\d+_\d+_\d+)\) " + \
      r"AppleWebKit\/(\d+\.\d+) \(KHTML, like Gecko\) Chrome\/" + \
      r"(\d+\.\d+\.\d+\.\d+) Safari\/(\d+\.\d+)",
      self.app
    )
    if safari_match:
      self.device = 'mac'
      self.deviceType = 'desktop'
      self.browser = 'safari'
      self.os = safari_match.group( 1 ).replace( '_', '.' )
      self.webkit = safari_match.group( 2 )
      self.version =  safari_match.group( 3 )
      return True
    if chrome_match:
      self.device = 'mac'
      self.deviceType = 'desktop'
      self.browser = 'chrome'
      self.os = chrome_match.group( 1 ).replace( '_', '.' )
      self.webkit = chrome_match.group( 2 )
      self.version =  chrome_match.group( 3 )
      return True
    return False

  def _matchWindows( self ):
    # Windows - Chrome
    match = re.match(
      r"Mozilla\/5\.0 \(Windows NT (\d+\.\d+); Win64; x64\) AppleWebKit" + \
      r"\/(\d+\.\d+) \(KHTML, like Gecko\) Chrome\/(\d+\.\d+\.\d+\.\d+) " + \
      r"Safari\/(\d+\.\d+)",
      self.app
    )
    if match:
      self.device = 'windows'
      self.deviceType = 'desktop'
      self.browser = 'chrome'
      self.os = match.group( 1 ).replace( '_', '.' )
      self.webkit = match.group( 2 )
      self.version = match.group( 3 )
      return True
    return False

  def _matchiPhone( self ):
    # iPhone - Safari
    iphone_match = re.match(
      r"Mozilla\/5\.0 \(iPhone; CPU iPhone OS (\d+_\d+) like Mac OS X\) " + \
      r"AppleWebKit\/(\d+\.\d+\.\d+) \(KHTML, like Gecko\) Version\/" + \
      r"(\d+\.\d+\.\d+|\d+\.\d) Mobile\/15E148 Safari\/(\d+\.\d+)",
      self.app
    )
    # iPhone - App
    app_match = re.match(
      r"Mozilla\/5\.0 \(iPhone; CPU iPhone OS (\d+_\d+) like Mac OS X\) " + \
      r"AppleWebKit\/(\d+\.\d+\.\d+) \(KHTML, like Gecko\) Mobile\/15E148 " + \
      r"(\[[a-zA-Z0-9]+\])",
      self.app
    )
    if iphone_match:
      self.device = 'iphone'
      self.deviceType = 'mobile'
      self.browser = 'safari'
      self.os = iphone_match.group(1).replace( '_', '.' )
      self.webkit = iphone_match.group(2)
      self.version = iphone_match.group(3)
      return True
    if app_match:
      self.device = 'iphone'
      self.deviceType = 'mobile'
      self.browser = app_match.group(3)
      self.os = app_match.group(1).replace( '_', '.' )
      self.webkit = app_match.group(2)
      self.version = None
      return True
    return False

  def _matchAndroid( self ):
    chrome_match = re.match(
      r"Mozilla/5.0 \(Linux; Android (\d+); ([a-zA-Z\d\s-]+)\) AppleWebKit/" + \
      r"([0-9]+\.[0-9]+) \(KHTML, like Gecko\) " + \
      r"Chrome/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+) Mobile Safari/([0-9]+\.[0-9]+)",
      self.app
    )
    samsung_match = re.match(
      r"Mozilla/5.0 \(Linux; Android (\d+); ([a-zA-Z\d\s-]+)\) AppleWebKit/" + \
      r"([0-9]+\.[0-9]+) \(KHTML, like Gecko\) " + \
      r"SamsungBrowser/([0-9]+\.[0-9]+) " + \
      r"Chrome/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+) Mobile Safari/([0-9]+\.[0-9]+)",
      self.app
    )
    if chrome_match:
      self.device = chrome_match.group(2)
      self.deviceType = 'mobile'
      self.browser = 'chrome'
      self.os = chrome_match.group(1)
      self.webkit = chrome_match.group(3)
      self.version = chrome_match.group(4)
      return True
    if samsung_match:
      self.device = samsung_match.group(2)
      self.deviceType = 'mobile'
      self.browser = 'samsung'
      self.os = samsung_match.group(1)
      self.webkit = samsung_match.group(3)
      self.version = samsung_match.group(4)
      return True
    return False

def itemToBrowser( item ):
  '''Parses a DynamoDB item as a browser object.

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
  browser : Browser
    The browser object parsed from the DynamoDB item.
  '''
  try:
    return Browser(
      item['PK']['S'].split('#')[1], item['App']['S'], item['Width']['N'],
      item['Height']['N'], item['DateVisited']['S'],
      None if 'NULL' in item['Device'].keys() else item['Device']['S'],
      None if 'NULL' in item['DeviceType'].keys() else item['DeviceType']['S'],
      None if 'NULL' in item['Browser'].keys() else item['Browser']['S'],
      None if 'NULL' in item['OS'].keys() else item['OS']['S'],
      None if 'NULL' in item['Webkit'].keys() else item['Webkit']['S'],
      None if 'NULL' in item['Version'].keys() else item['Version']['S'],
      item['DateAdded']['S']
    )
  except Exception as e:
    print( f'ERROR itemToBrowser: { e }' )
    raise toItemException( 'browser' ) from e
