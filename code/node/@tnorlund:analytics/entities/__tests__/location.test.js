const { Location, locationFromItem } = require( `..` )

/** The unique ID for each visitor */
const id = `171a0329-f8b2-499c-867d-1942384ddd5f`
const ip = `0.0.0.0`
const country = `US` 
const region = `CA`
const city = `Westlake Village`
const latitude =  34.14584
const longitude = -118.80565
const postalCode = `91361`
const timezone = `-08:00`
const domains = [`cpe-75-82-84-171.socal.res.rr.com`]
const autonomousSystem = {
  'asn': 20001,
  'domain': `https://www.spectrum.com`,
  'route': `75.82.0.0/15`,
  'type': `Cable/DSL/ISP`
} 
const autonomousSystem_null = {
  'asn': 20001,
  'domain': undefined,
  'route': `75.82.0.0/15`,
  'type': undefined
} 
const isp = `Charter Communications`
const proxy = false
const vpn = false
const tor = false
const dateAdded = new Date()

const validLocations = [
  { id, ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded },
  { id, ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded: dateAdded.toISOString() }
]

const invalidLocations = [
  {},
  { id },
  { id, ip: `something` },
  { id, ip },
  { id, ip, country },
  { id, ip, country, region },
  { id, ip, country, region, city },
  { id, ip, country, region, city, latitude: `something` },
  { id, ip, country, region, city, latitude },
  { id, ip, country, region, city, latitude, longitude: `something` },
  { id, ip, country, region, city, latitude, longitude },
]

describe( `location object`, () => {
  test.each( validLocations )(
    `valid constructor`,
    parameter => {
      const location = new Location( parameter )
      expect( location.id ).toEqual( id )
      expect( location.ip ).toEqual( ip )
      expect( location.country ).toEqual( country )
      expect( location.city ).toEqual( city )
      expect( location.latitude ).toEqual( latitude )
      expect( location.postalCode ).toEqual( postalCode )
      expect( location.timezone ).toEqual( timezone )
      expect( location.domains ).toEqual( domains )
      expect( location.autonomousSystem ).toEqual( autonomousSystem )
      expect( location.isp ).toEqual( isp )
      expect( location.proxy ).toEqual( proxy )
      expect( location.dateAdded ).toEqual( dateAdded )
    } 
  )

  test.each( invalidLocations )( 
    `invalid constructor`,
    parameter => expect( () => new Location( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Location( { id, ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } ).pk() ).toEqual( {
    'S': `VISITOR#${ id }`
  } ) )

  test( `key`, () => expect( new Location( { id, ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } ).key() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `#LOCATION` }
  } ) )

  test( `toItem`, () => expect( new Location( { id, ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } ).toItem() ).toEqual( { 
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `#LOCATION` },
    'Type': { 'S': `location` },
    'IP': { 'S': ip },
    'Country': { 'S': country },
    'Region': { 'S': region },
    'City': { 'S': city },
    'Latitude': { 'N': latitude.toString() },
    'Longitude': { 'N': longitude.toString() },
    'PostalCode': { 'S': postalCode },
    'TimeZone': { 'S': timezone },
    'Domains': { 'SS': domains },
    'AutonomousSystem': { 'M': {
      'asn': { 'N': `20001` },
      'domain': { 'S': `https://www.spectrum.com` },
      'route': { 'S': `75.82.0.0/15` },
      'type': { 'S': `Cable/DSL/ISP` }
    } },
    'ISP': { 'S': isp },
    'Proxy': { 'BOOL': proxy },
    'VPN': { 'BOOL': vpn },
    'TOR': { 'BOOL': tor },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `toItem`, () => expect( new Location( { id, ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem: autonomousSystem_null, isp, proxy, vpn, tor, dateAdded } ).toItem() ).toEqual( { 
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `#LOCATION` },
    'Type': { 'S': `location` },
    'IP': { 'S': ip },
    'Country': { 'S': country },
    'Region': { 'S': region },
    'City': { 'S': city },
    'Latitude': { 'N': latitude.toString() },
    'Longitude': { 'N': longitude.toString() },
    'PostalCode': { 'S': postalCode },
    'TimeZone': { 'S': timezone },
    'Domains': { 'SS': domains },
    'AutonomousSystem': { 'M': {
      'asn': { 'N': `20001` },
      'domain': { 'NULL': true },
      'route': { 'S': `75.82.0.0/15` },
      'type': { 'NULL': true }
    } },
    'ISP': { 'S': isp },
    'Proxy': { 'BOOL': proxy },
    'VPN': { 'BOOL': vpn },
    'TOR': { 'BOOL': tor },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `locationFromItem`, () => {
    const location = new Location(  { id, ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } )
    expect( locationFromItem( location.toItem() ) ).toStrictEqual( location )
  } )

  test( `locationFromItem`, () => {
    const location = new Location(  { id, ip, country, region, city, latitude, longitude, timezone, domains:[], autonomousSystem: autonomousSystem_null, isp, proxy, vpn, tor, dateAdded } )
    expect( locationFromItem( location.toItem() ) ).toEqual( { ...location, domains: undefined } )
  } )
} )
