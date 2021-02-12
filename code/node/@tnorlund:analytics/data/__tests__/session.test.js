const {
  addVisitor,
  addSession, getSession
} = require( `../` )
const { 
  Visitor, Session 
} = require( `../../entities` )

/** The unique ID for each visitor */
const id = `171a0329-f8b2-499c-867d-1942384ddd5f`
/** The average time spent on each page */
const avgTime = 10.0
/** The total time spent on pages */
const totalTime = 100.0
/** The date-time the session starts */
const sessionStart = new Date()
const visitor = new Visitor( { id } )
const session = new Session( { id, avgTime, totalTime, sessionStart } )

describe( `addSession`, () => {
  test( `A session can be added to the table`, async () => {
    await addVisitor( `test-table`, visitor )
    const result = await addSession( `test-table`, visitor, session )
    expect( result ).toEqual( { session } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const result = await addSession( `not-a-table`, visitor, session )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the session exists`, async () => {
    await addVisitor( `test-table`, visitor )
    await addSession( `test-table`, visitor, session )
    const result = await addSession( `test-table`, visitor, session )
    expect( result ).toEqual( { error: `Session already in table` } )
  } )

  test( `Returns an error when the visitor does not exists`, async () => {
    const result = await addSession( `test-table`, visitor, session )
    expect( result ).toEqual( { error: `Visitor does not exist` } )
  } )

  test( `Throws an error when no session object is given`, async () => {
    await expect(
      addSession( `test-table`, visitor )
    ).rejects.toThrow( `Must give session` )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      addSession( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      addSession()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getSession`, () => {
  test( `A session can be queried from table`, async () => {
    await addVisitor( `test-table`, visitor )
    await addSession( `test-table`, visitor, session )
    const result = await getSession( `test-table`, session )
    expect( result ).toEqual( { session } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const result = await getSession( `not-a-table`, session )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the session does not exists`, async () => {
    const result = await getSession( `test-table`, session )
    expect( result ).toEqual( { error: `Session does not exist` } )
  } )

  test( `Throws an error when no session object is given`, async () => {
    await expect(
      getSession( `test-table` )
    ).rejects.toThrow( `Must give session` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      getSession()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )