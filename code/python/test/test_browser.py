import datetime
import pytest
from dynamo.entities import Browser, itemToBrowser

visitor_id = '171a0329-f8b2-499c-867d-1942384ddd5f'

def test_default_pixel_init( pixel_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, pixel_app, 100, 200, '2020-01-01T00:00:00.000Z', dateAdded = currentTime
  )
  assert browser.id == visitor_id
  assert browser.app == pixel_app
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'Pixel 4 XL'
  assert browser.deviceType == 'mobile'
  assert browser.browser == 'chrome'
  assert browser.os == '11'
  assert browser.webkit == '537.36'
  assert browser.version == '86.0.4240.198'

def test_default_samsung_G950U_init( samsung_G950U_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, samsung_G950U_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime
  )
  assert browser.app == samsung_G950U_app
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'SM-G950U'
  assert browser.deviceType == 'mobile'
  assert browser.browser == 'chrome'
  assert browser.os == '9'
  assert browser.webkit == '537.36'
  assert browser.version == '87.0.4280.101'

def test_default_samsung_G981U1_init( samsung_G981U1_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, samsung_G981U1_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime
  )
  assert browser.app == samsung_G981U1_app
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'SAMSUNG SM-G981U1'
  assert browser.deviceType == 'mobile'
  assert browser.browser == 'samsung'
  assert browser.os == '10'
  assert browser.webkit == '537.36'
  assert browser.version == '13.0'

def test_default_mac_chrome_init( mac_chrome_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, mac_chrome_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime
  )
  assert browser.app == mac_chrome_app
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'mac'
  assert browser.deviceType == 'desktop'
  assert browser.browser == 'chrome'
  assert browser.os == '11.1.0'
  assert browser.webkit == '537.36'
  assert browser.version == '87.0.4280.88'

def test_default_mac_safari_init( mac_safari_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, mac_safari_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime
  )
  assert browser.app == mac_safari_app
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'mac'
  assert browser.deviceType == 'desktop'
  assert browser.browser == 'safari'
  assert browser.os == '10.15.6'
  assert browser.webkit == '605.1.15'
  assert browser.version == '14.0.2'

def test_default_windows_chrome_init( windows_chrome_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, windows_chrome_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime
  )
  assert browser.app == windows_chrome_app
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'windows'
  assert browser.deviceType == 'desktop'
  assert browser.browser == 'chrome'
  assert browser.os == '10.0'
  assert browser.webkit == '537.36'
  assert browser.version == '87.0.4280.88'

def test_default_iphone_safari_init( iphone_safari_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, iphone_safari_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime
  )
  assert browser.app == iphone_safari_app
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'iphone'
  assert browser.deviceType == 'mobile'
  assert browser.browser == 'safari'
  assert browser.os == '14.3'
  assert browser.webkit == '605.1.15'
  assert browser.version == '14.0.2'

def test_default_iphone_linkedin_init( iphone_linkedin_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, iphone_linkedin_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime
  )
  assert browser.app == iphone_linkedin_app
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device == 'iphone'
  assert browser.deviceType == 'mobile'
  assert browser.browser == '[LinkedInApp]'
  assert browser.os == '14.2'
  assert browser.webkit == '605.1.15'
  assert browser.version is None

def test_default_unknown_init():
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, 'unknown', 100, 200, '2020-01-01T00:00:00.000Z', dateAdded = currentTime
  )
  assert browser.app == 'unknown'
  assert browser.id == visitor_id
  assert browser.width == 100
  assert browser.height == 200
  assert browser.dateVisited == datetime.datetime( 2020, 1, 1, 0, 0, 0 )
  assert browser.dateAdded == currentTime
  assert browser.device is None
  assert browser.deviceType is None
  assert browser.browser is None
  assert browser.os is None
  assert browser.webkit is None
  assert browser.version is None

def test_key( pixel_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, pixel_app, 100, 200, '2020-01-01T00:00:00.000Z', dateAdded = currentTime
  )
  assert browser.key() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': 'BROWSER#2020-01-01T00:00:00.000Z' }
  }

def test_pk( pixel_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, pixel_app, 100, 200, '2020-01-01T00:00:00.000Z', dateAdded = currentTime
  )
  assert browser.pk() == { 'S': f'VISITOR#{ visitor_id }' }

def test_toItem( pixel_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, pixel_app, 100, 200, '2020-01-01T00:00:00.000Z', dateAdded = currentTime
  )
  assert browser.toItem() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': 'BROWSER#2020-01-01T00:00:00.000Z' },
    'Type': { 'S': 'browser' },
    'App': { 'S': pixel_app },
    'Width': { 'N': '100' },
    'Height': { 'N': '200' },
    'DateVisited': { 'S': '2020-01-01T00:00:00.000Z' },
    'Device': { 'S': 'Pixel 4 XL' },
    'DeviceType': { 'S': 'mobile' },
    'Browser': { 'S': 'chrome' },
    'OS': { 'S': '11' },
    'Webkit': { 'S': '537.36' },
    'Version': { 'S': '86.0.4240.198' },
    'DateAdded': { 'S': currentTime.strftime( '%Y-%m-%dT%H:%M:%S.' ) \
      + currentTime.strftime('%f')[:3] + 'Z' }
  }

def test_repr( pixel_app ):
  assert repr( Browser(
    visitor_id, pixel_app, 100, 200, '2020-01-01T00:00:00.000Z'
  ) ) == f'{ visitor_id } - chrome'

def test_itemToBrowser( pixel_app ):
  currentTime = datetime.datetime.now()
  browser = Browser(
    visitor_id, pixel_app, 100, 200, '2020-01-01T00:00:00.000Z',
    dateAdded = currentTime.strftime( '%Y-%m-%dT%H:%M:%S.' ) \
      + currentTime.strftime('%f')[:3] + 'Z'
  )
  newBrowser = itemToBrowser( browser.toItem() )
  assert browser.id == newBrowser.id
  assert browser.app == newBrowser.app
  assert browser.width == newBrowser.width
  assert browser.height == newBrowser.height
  assert browser.dateVisited == newBrowser.dateVisited
  assert browser.dateAdded == newBrowser.dateAdded
  assert browser.device == newBrowser.device
  assert browser.deviceType == newBrowser.deviceType
  assert browser.browser == newBrowser.browser
  assert browser.os == newBrowser.os
  assert browser.webkit == newBrowser.webkit
  assert browser.version == newBrowser.version

def test_itemToBrowser_exception():
  with pytest.raises( Exception ) as e:
    assert itemToBrowser( {} )
  assert str( e.value ) == "Could not parse browser"
