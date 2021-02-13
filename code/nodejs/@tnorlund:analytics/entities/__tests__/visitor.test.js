const { Visitor, visitorFromItem } = require( `..` )

/** The unique ID for each visitor */
const id = `171a0329-f8b2-499c-867d-1942384ddd5f`

const validVisitors = [
  { id },
  { id, numberSessions: `0` },
  { id, numberSessions: 0 },
]

const invalidVisitors = [
  {},
  { id, numberSessions: `something` },
  { id, numberSessions: `-1` }
]

describe( `visitor object`, () => {
  test.each( validVisitors )(
    `valid constructor`,
    parameter => {
      const visitor = new Visitor( parameter )
      expect( visitor.id ).toEqual( id )
      expect( visitor.numberSessions ).toEqual( 0 )
    }
  )

  test.each( invalidVisitors )(
    `invalid constructor`,
    parameter => expect( () => new Visitor( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Visitor( { id } ).pk() ).toEqual( { 
    'S': `VISITOR#${ id }` 
  } ) )

  test( `key`, () => expect( new Visitor( { id } ).key() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `#VISITOR` }
  } ) )

  test( `toItem`, () => expect( new Visitor( { id } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `#VISITOR` },
    'Type': { 'S': `visitor` },
    'NumberSessions': { 'N': `0` }
  } ) )

  test( `visitorFromItem`, () => {
    const visitor = new Visitor( { id } )
    expect( visitorFromItem( visitor.toItem() ) ).toEqual( visitor )
  } )
} )