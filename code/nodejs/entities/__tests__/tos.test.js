const { TOS, tosFromItem } = require( `..` )
const { ZeroPadNumber } = require( `../utils` )

const userNumber = 1
const version = new Date()
const dateAccepted = new Date()

const validTOS = [
  { userNumber, version, dateAccepted },
  { userNumber, version: version.toISOString(), dateAccepted },
  { userNumber, version, dateAccepted: dateAccepted.toISOString() },
  { userNumber, version }
]

const invalidTOS = [
  { version },
  { userNumber }
]

describe( `TOS object`, () => {
  test.each( validTOS )(
    `valid constructor`,
    parameter => {
      const tos = new TOS( parameter )
      expect( tos.userNumber ).toEqual( userNumber )
      expect( tos.version ).toEqual( version )
    }
  )

  test.each( invalidTOS )(
    `invalid constructor`,
    parameter => expect( () => new TOS( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new TOS( { userNumber, version } ).pk() ).toEqual( {
    'S': `USER#${ ZeroPadNumber( userNumber ) }`
  } ) )

  test( `key`, () => expect( new TOS( { userNumber, version } ).key() ).toEqual( {
    'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
    'SK': { 'S': `#TOS#${ version.toISOString() }` }
  } ) )

  test( `toItem`, () => expect( new TOS( { userNumber, version, dateAccepted } ).toItem() ).toEqual( {
    'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
    'SK': { 'S': `#TOS#${ version.toISOString() }` },
    'Type': { 'S': `terms of service` },
    'DateAccepted': { 'S': dateAccepted.toISOString() }
  } ) )

  test( `tosFromItem`, () => {
    const tos = new TOS( { userNumber, version, dateAccepted } )
    expect( tosFromItem( tos.toItem() ) ).toStrictEqual( tos )
  } )
} )