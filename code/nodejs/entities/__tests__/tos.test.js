const { TOS, tosFromItem } = require( `..` )
const { ZeroPadNumber } = require( `../utils` )

const username = `4ec5a264-733d-4ee5-b59c-7911539e3942`
const version = new Date()
const dateAccepted = new Date()

const validTOS = [
  { username, version, dateAccepted },
  { username, version: version.toISOString(), dateAccepted },
  { username, version, dateAccepted: dateAccepted.toISOString() },
  { username, version }
]

const invalidTOS = [
  { version },
  { username }
]

describe( `TOS object`, () => {
  test.each( validTOS )(
    `valid constructor`,
    parameter => {
      const tos = new TOS( parameter )
      expect( tos.username ).toEqual( username )
      expect( tos.version ).toEqual( version )
    }
  )

  test.each( invalidTOS )(
    `invalid constructor`,
    parameter => expect( () => new TOS( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new TOS( { username, version } ).pk() ).toEqual( {
    'S': `USER#${ username }`
  } ) )

  test( `key`, () => expect( new TOS( { username, version } ).key() ).toEqual( {
    'PK': { 'S': `USER#${ username }` },
    'SK': { 'S': `#TOS#${ version.toISOString() }` }
  } ) )

  test( `toItem`, () => expect( new TOS( { username, version, dateAccepted } ).toItem() ).toEqual( {
    'PK': { 'S': `USER#${ username }` },
    'SK': { 'S': `#TOS#${ version.toISOString() }` },
    'Type': { 'S': `terms of service` },
    'DateAccepted': { 'S': dateAccepted.toISOString() }
  } ) )

  test( `tosFromItem`, () => {
    const tos = new TOS( { username, version, dateAccepted } )
    expect( tosFromItem( tos.toItem() ) ).toStrictEqual( tos )
  } )
} )