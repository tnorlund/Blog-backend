const {
  addBrowser, getBrowser
} = require( `../` )
const { Browser } = require( `../../entities` )

const browser = new Browser( {
  id: `171a0329-f8b2-499c-867d-1942384ddd5f`,
  userAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) `
  + `AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148`
  + ` Safari/604.1`,
  ip: `0.0.0.0`,
  width: 414,
  height: 896,
  dateVisited: new Date(),
  device: `iphone`,
  deviceType: `mobile`,
  browser: `safari`,
  os: `13.7`,
  webkit: `605.1.15`,
  version: `13.1.2`,
  dateAdded: new Date()
} )

describe( `addBrowser`, () => {
  test( `A browser can be added to the table`, async () => {
    const result = await addBrowser( `test-table`, browser )
    expect( result ).toEqual( { browser } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const result = await addBrowser( `not-a-table`, browser )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the browser exists`, async () => {
    await addBrowser( `test-table`, browser )
    const result = await addBrowser( `test-table`, browser )
    expect( result ).toEqual( { error: `Browser already exists` } )
  } )

  test( `Throws an error when no browser object is given`, async () => {
    await expect(
      addBrowser( `test-table` )
    ).rejects.toThrow( `Must give browser` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      addBrowser()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getBrowser`, () => {
  test( `A browser can be queried from the table`, async () => {
    await addBrowser( `test-table`, browser )
    const result = await getBrowser( `test-table`, browser )
    expect( result ).toEqual( { browser } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await getBrowser( `test-table`, browser )
    expect( result ).toEqual( { 'error': `Browser does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await getBrowser( `not-a-table`, browser )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no browser object is given`, async () => {
    await expect(
      getBrowser( `test-table` )
    ).rejects.toThrow( `Must give browser` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getBrowser()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )