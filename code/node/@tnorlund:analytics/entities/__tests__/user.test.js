const { User, userFromItem } = require( `..` )
const { ZeroPadNumber } = require( `../utils` )

const name = `Tyler`
const email = `someone@me.com`
const dateJoined = new Date()

const validUsers = [
  { name, email, dateJoined },
  { name, email, userNumber: `0`, dateJoined },
  { name, email, userNumber: `0`, dateJoined: dateJoined.toISOString() },
  { name, email, dateJoined, numberFollows: `0` },
  { name, email, dateJoined, numberComments: `0` },
  { name, email, dateJoined, numberVotes: `0` },
  { name, email, dateJoined, totalKarma: `0` },
]

const invalidUsers = [
  {},
  { name },
  { name, email, userNumber: `something`},
  { name, email, userNumber: `-1`},
  { name, email, numberFollows: `something`},
  { name, email, numberFollows: `-1`},
  { name, email, numberComments: `something` },
  { name, email, numberComments: `-1` },
  { name, email, numberVotes: `something` },
  { name, email, numberVotes: `-1` },
  { name, email, totalKarma: `something` }
]

describe( `user object`, () => {
  test.each( validUsers )(
    `valid constructor`,
    parameter => {
      const user = new User( parameter )
      expect( user.name ).toEqual( name )
      expect( user.email ).toEqual( email )
      expect( user.userNumber ).toEqual( 0 )
      expect( user.dateJoined ).toEqual( dateJoined )
      expect( user.numberFollows ).toEqual( 0 )
      expect( user.numberComments ).toEqual( 0 )
      expect( user.numberVotes ).toEqual( 0 )
      expect( user.totalKarma ).toEqual( 0 )
    }
  )

  test.each( invalidUsers )( 
    `invalid constructor`,
    parameter => expect( () => new User( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new User( { name, email } ).pk() ).toEqual( {
    'S': `USER#${ ZeroPadNumber( 0 ) }`
  } ) )

  test( `key`, () => expect( new User( { name, email } ).key() ).toEqual( {
    'PK': { 'S': `USER#${ ZeroPadNumber( 0 ) }` },
    'SK': { 'S': `#USER` }
  } ) )

  test( `toItem`, () => expect( new User( { name, email, dateJoined } ).toItem() ).toEqual( {
    'PK': { 'S': `USER#${ ZeroPadNumber( 0 ) }` },
    'SK': { 'S': `#USER` },
    'Type': { 'S': `user` },
    'Name': { 'S': name },
    'Email': { 'S': email },
    'DateJoined': { 'S': dateJoined.toISOString() },
    'NumberFollows': { 'N': `0` },
    'NumberComments': { 'N': `0` },
    'NumberVotes': { 'N': `0` },
    'TotalKarma': { 'N': `0` }
  } ) )

  test( `userFromItem`, () => {
    const user = new User( { name, email, dateJoined } )
    expect( userFromItem( user.toItem() ) ).toEqual( user )
  } )

} )