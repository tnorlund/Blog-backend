const { User, userFromItem } = require( `..` )

const name = `Tyler`
const email = `someone@me.com`
const username = `4ec5a264-733d-4ee5-b59c-7911539e3942`
const dateJoined = new Date()

const validUsers = [
  { name, email, username, dateJoined: dateJoined },
  { name, email, username, dateJoined: dateJoined.toISOString() },
  { name, email, username, dateJoined, numberFollows: `0` },
  { name, email, username, dateJoined, numberComments: `0` },
  { name, email, username, dateJoined, numberVotes: `0` },
  { name, email, username, dateJoined, totalKarma: `0` },
]

const invalidUsers = [
  {},
  { name },
  { name, email, username: `something`},
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
      expect( user.username ).toEqual( username )
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

  test( `pk`, () => expect( new User( { name, email, username } ).pk() ).toEqual( {
    'S': `USER#${ username }`
  } ) )

  test( `key`, () => expect( new User( { name, email, username } ).key() ).toEqual( {
    'PK': { 'S': `USER#${ username }` },
    'SK': { 'S': `#USER` }
  } ) )

  test( `toItem`, () => expect( new User( { name, email, username, dateJoined } ).toItem() ).toEqual( {
    'PK': { 'S': `USER#${ username }` },
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
    const user = new User( { name, email, username, dateJoined } )
    expect( userFromItem( user.toItem() ) ).toEqual( user )
  } )

} )