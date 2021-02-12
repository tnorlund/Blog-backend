const {
  addLocation, getLocation
} = require( `../` )
const { Location } = require( `../../entities` )

const location = new Location( {
  id: `171a0329-f8b2-499c-867d-1942384ddd5f`,
  ip: `0.0.0.0`, 
  country: `US`, 
  region: `CA`, 
  city: `Westlake Village`, 
  latitude: 34.14584, 
  longitude: -118.80565, 
  postalCode: `91361`, 
  timezone: `-08:00`, 
  domains: [`cpe-75-82-84-171.socal.res.rr.com`], 
  autonomousSystem: {
    'asn': 20001,
    'domain': `https://www.spectrum.com`,
    'route': `75.82.0.0/15`,
    'type': `Cable/DSL/ISP`
  }, 
  isp: `Charter Communications`, 
  proxy: false, 
  vpn: false, 
  tor: false, 
  dateAdded: new Date()
} )

describe( `addLocation`, () => {
  test( `A location can be added to the table`, async () => {
    const result = await addLocation( `test-table`, location )
    expect( result ).toEqual( { location } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const result = await addLocation( `not-a-table`, location )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the location exists`, async () => {
    await addLocation( `test-table`, location )
    const result = await addLocation( `test-table`, location )
    expect( result ).toEqual( { error: `Location already exists` } )
  } )

  test( `Throws an error when no location object is given`, async () => {
    await expect(
      addLocation( `test-table` )
    ).rejects.toThrow( `Must give location` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      addLocation()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getLocation`, () => {
  test( `A location can be queried from the table`, async () => {
    await addLocation( `test-table`, location )
    const result = await getLocation( `test-table`, location )
    expect( result ).toEqual( { location } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await getLocation( `test-table`, location )
    expect( result ).toEqual( { 'error': `Location does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await getLocation( `not-a-table`, location )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no location object is given`, async () => {
    await expect(
      getLocation( `test-table` )
    ).rejects.toThrow( `Must give location` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getLocation()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )