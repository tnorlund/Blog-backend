const { Session, sessionFromItem } = require( `../` )

/** The unique ID for each visitor */
const id = `171a0329-f8b2-499c-867d-1942384ddd5f`
/** The average time spent on each page */
const avgTime = 10.0
/** The total time spent on pages */
const totalTime = 100.0
/** The date-time the session starts */
const sessionStart = new Date()

const validSessions = [
  { id, avgTime, totalTime, sessionStart },
  { id, avgTime: avgTime.toString(), totalTime, sessionStart },
  { id, avgTime, totalTime: totalTime.toString(), sessionStart },
  { id, avgTime, totalTime, sessionStart: sessionStart.toISOString() }
]

const invalidSessions = [
  {},
  { sessionStart }
]

describe( `session object`, () => {
  test.each( validSessions )(
    `valid constructor`,
    parameter => {
      const session = new Session( parameter )
      expect( session.id ).toEqual( id )
      expect( session.avgTime ).toEqual( parseFloat( avgTime ) )
      expect( session.totalTime ).toEqual( parseFloat( totalTime ) )
      expect( session.sessionStart ).toEqual( sessionStart )
    } 
  )

  test( `valid constructor`, () => { 
    const session =  new Session( { id, sessionStart } )
    expect( session.id ).toEqual( id )
    expect( session.avgTime ).toEqual( undefined )
    expect( session.totalTime ).toEqual( undefined )
    expect( session.sessionStart ).toEqual( sessionStart )
  } )

  test.each( invalidSessions )( 
    `invalid constructor`,
    parameter => expect( () => new Session( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Session( { id, avgTime, totalTime, sessionStart } ).pk() ).toEqual( {
    'S': `VISITOR#${ id }`
  } ) )

  test( `key`, () => expect( new Session( { id, avgTime, totalTime, sessionStart } ).key() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `SESSION#${ sessionStart.toISOString() }` }
  } ) )

  test( `gsi2pk`, () => expect( new Session( { id, avgTime, totalTime, sessionStart } ).gsi2pk() ).toEqual( {
    'S': `SESSION#${ id }#${ sessionStart.toISOString() }`
  } ) )

  test( `gsi2`, () => expect( new Session( { id, avgTime, totalTime, sessionStart } ).gsi2() ).toEqual( {
    'GSI2PK': { 'S': `SESSION#${ id }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `#SESSION` }
  } ) )

  test( `toItem`, () => expect( new Session( { id, avgTime, totalTime, sessionStart } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `SESSION#${ sessionStart.toISOString() }` },
    'GSI2PK': { 'S': `SESSION#${ id }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `#SESSION` },
    'Type': { 'S': `session` },
    'AverageTime': { 'N': avgTime.toString() },
    'TotalTime': { 'N': totalTime.toString() }
  } ) )

  test( `toItem`, () => expect( new Session( { id, sessionStart } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `SESSION#${ sessionStart.toISOString() }` },
    'GSI2PK': { 'S': `SESSION#${ id }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `#SESSION` },
    'Type': { 'S': `session` },
    'AverageTime': { 'NULL': true },
    'TotalTime': { 'NULL': true }
  } ) )

  test( `sessionFromItem`, () => {
    const session = new Session( { id, avgTime, totalTime, sessionStart } )
    expect( sessionFromItem( session.toItem() ) ).toEqual( session )
  } )

  test( `sessionFromItem`, () => {
    const session = new Session( { id, sessionStart } )
    expect( sessionFromItem( session.toItem() ) ).toEqual( session )
  } )
} )