const { Browser, browserFromItem } = require( `..` )

const userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1`
/** The unique ID for each visitor */
const id = `171a0329-f8b2-499c-867d-1942384ddd5f`

const width = 414
const height = 896
const dateVisited = new Date()
const device = `iphone`
const deviceType = `mobile`
const browser_name = `safari`
const os = `13.7`
const webkit = `605.1.15`
const version = `13.1.2`
const dateAdded = new Date()

const validBrowsers = [
  { userAgent, id, width, height, dateVisited, device, deviceType, browser: browser_name, os, webkit, version, dateAdded },
  { userAgent, id, width, height, dateVisited: dateVisited.toISOString(), device, deviceType, browser: browser_name, os, webkit, version, dateAdded },
  { userAgent, id, width, height, dateVisited, device, deviceType, browser: browser_name, os, webkit, version, dateAdded: dateAdded.toISOString() }
]

const invalidBrowsers = [
  {},
  { userAgent }
]

describe( `browser object`, () => {
  test.each( validBrowsers )(
    `valid constructor`,
    parameter => {
      const browser = new Browser( parameter )
      expect( browser.userAgent ).toEqual( userAgent )
      expect( browser.id ).toEqual( id )
      expect( browser.width ).toEqual( width )
      expect( browser.height ).toEqual( height )
      expect( browser.dateVisited ).toEqual( dateVisited )
      expect( browser.device ).toEqual( device )
      expect( browser.deviceType ).toEqual( deviceType )
      expect( browser.browser ).toEqual( browser_name )
      expect( browser.os ).toEqual( os )
      expect( browser.webkit ).toEqual( webkit )
      expect( browser.version ).toEqual( version )
      expect( browser.dateAdded ).toEqual( dateAdded )
    }
  )

  test( `valid constructor`, () => {
    const browser = new Browser( { userAgent, id, width, height, dateVisited, dateAdded } )
    expect( browser.userAgent ).toEqual( userAgent )
    expect( browser.id ).toEqual( id )
    expect( browser.width ).toEqual( width )
    expect( browser.height ).toEqual( height )
    expect( browser.dateVisited ).toEqual( dateVisited )
    expect( browser.dateAdded ).toEqual( dateAdded )
  } )

  test.each( invalidBrowsers )(
    `invalid constructor`,
    parameter => expect( () => new Browser( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Browser( { userAgent, id, width, height, dateVisited, dateAdded } ).pk() ).toEqual( {
    'S': `VISITOR#${ id }`
  } ) )

  test( `key`, () => expect( new Browser( { userAgent, id, width, height, dateVisited, dateAdded } ).key() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `BROWSER#${ dateVisited.toISOString() }` }
  } ) )

  test( `toItem`, () => expect( new Browser( { userAgent, id, width, height, dateVisited, device, deviceType, browser: browser_name, os, webkit, version, dateAdded } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `BROWSER#${ dateVisited.toISOString() }` },
    'Type': { 'S': `browser` },
    'UserAgent': { 'S': userAgent },
    'Width': { 'N': width.toString() },
    'Height': { 'N': height.toString() },
    'DateVisited': { 'S': dateVisited.toISOString() },
    'Device': { 'S': device },
    'DeviceType': { 'S': deviceType },
    'Browser': { 'S': browser_name },
    'OS': { 'S': os },
    'Webkit': { 'S': webkit },
    'Version': { 'S': version },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `toItem`, () => expect( new Browser( { userAgent, id, width, height, dateVisited, dateAdded } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `BROWSER#${ dateVisited.toISOString() }` },
    'Type': { 'S': `browser` },
    'UserAgent': { 'S': userAgent },
    'Width': { 'N': width.toString() },
    'Height': { 'N': height.toString() },
    'DateVisited': { 'S': dateVisited.toISOString() },
    'Device': { 'NULL': true, },
    'DeviceType': { 'NULL': true, },
    'Browser': { 'NULL': true, },
    'OS': { 'NULL': true, },
    'Webkit': { 'NULL': true, },
    'Version': { 'NULL': true, },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `browserFromItem`, () => {
    const browser = new Browser( { userAgent, id, width, height, dateVisited, device, deviceType, browser: browser_name, os, webkit, version, dateAdded } )
    expect( browserFromItem( browser.toItem() ) ).toStrictEqual( browser )
  } )

  test( `browserFromItem`, () => {
    const browser = new Browser( { userAgent, id, width, height, dateVisited, dateAdded } )
    expect( browserFromItem( browser.toItem() ) ).toStrictEqual( browser )
  } )
} )
