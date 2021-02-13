const {
  addBrowser, addSession,
  addVisitor, getVisitor, getVisitorDetails,
  incrementNumberSessions, decrementNumberSessions
} = require( `../` )
const { Visitor, Browser, Session } = require( `../../entities` )

/** The unique ID for each visitor */
const id = `171a0329-f8b2-499c-867d-1942384ddd5f`
/** The visitor's IP address */
const ip = `0.0.0.0`
const visitor = new Visitor( { id } )
const browser = new Browser( {
  userAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) `
  + `AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148`
  + ` Safari/604.1`,
  id,
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
const session = new Session( {
  id, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
} )

describe( `addVisitor`, () => {
  test( `A visitor can be added to the table`, async () => {
    const result = await addVisitor( `test-table`, visitor )
    expect( result ).toEqual( { visitor } )
  } )

  test( `Returns an error when the visitor exists`, async () => {
    await addVisitor( `test-table`, visitor )
    const result = await addVisitor( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor already in table` } )
  } )

  test( `Returns an error when the table does not exist`, async () => {
    const result = await addVisitor( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      addVisitor( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addVisitor()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getVisitor`, () => {
  test( `A visitor can be queried from the table`, async () => {
    await addVisitor( `test-table`, visitor )
    const result = await getVisitor( `test-table`, visitor )
    expect( result ).toEqual( { visitor } )
  } )

  test( `Returns an error when the visitor does not exists`, async () => {
    const result = await getVisitor( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor does not exist` } )
  } )

  test( `Returns an error when the table does not exist`, async () => {
    const result = await getVisitor( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      getVisitor( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getVisitor()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getVisitorDetails`, () => {
  test( 
    `A visitor and their details can be queried from the table`, 
    async () => {
      await addVisitor( `test-table`, visitor )
      await addSession( `test-table`, visitor, session )
      await addBrowser( `test-table`, browser )
      const result = await getVisitorDetails( `test-table`, visitor )
      expect( result ).toEqual( {
        visitor: { ...visitor, numberSessions: 1 },
        sessions: [ session ],
        browsers: [ browser ]
      } )
    } 
  )

  test( `Returns an error when the visitor does not exists`, async () => {
    const result = await getVisitorDetails( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await getVisitorDetails( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      getVisitorDetails( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      getVisitorDetails()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberSessions`, () => {
  test( `The number of sessions the visitor has can be incremented`, 
    async () => { 
      let result = await addVisitor( `test-table`, visitor )
      result = await incrementNumberSessions( `test-table`, visitor )
      visitor.numberSessions += 1
      expect( result ).toEqual( { visitor } )
    } 
  )

  test( `Returns an error when the visitor does not exists`, async () => {
    const result = await incrementNumberSessions( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await incrementNumberSessions( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      incrementNumberSessions( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberSessions()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberSessions`, () => {
  test( `The number of sessions the visitor has can be decremented`, 
    async () => { 
      let visitor_with_sessions = new Visitor( { 
        ip, id, numberSessions: 2 
      } )
      let result = await addVisitor( `test-table`, visitor_with_sessions )
      result = await decrementNumberSessions( 
        `test-table`, visitor_with_sessions 
      )
      visitor_with_sessions.numberSessions -= 1
      expect( result ).toEqual( { visitor: visitor_with_sessions } )
    } 
  )

  test( `Returns an error when the visitor does not exists`, async () => {
    const result = await decrementNumberSessions( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await decrementNumberSessions( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      decrementNumberSessions( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberSessions()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )