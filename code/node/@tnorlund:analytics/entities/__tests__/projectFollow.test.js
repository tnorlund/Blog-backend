const { ProjectFollow, projectFollowFromItem } = require( `..` )
const{ ZeroPadNumber } = require( `../utils` )

const userName = `Tyler`
const userNumber = `1`
const email = `someone@me.com`
const slug = `/`
const title = `Tyler Norlund`
const dateFollowed = new Date()

const invalidProjectFollows = [
  { userNumber, email, slug, title },
  { userName, email, slug, title },
  { userName, userNumber, slug, title },
  { userName, userNumber, email, title },
  { userName, userNumber, email, slug }
]

describe( `projectFollow object`, () => {
  test( `valid constructor`, () => {
    const project_follow = new ProjectFollow( { userName, userNumber, email, slug, title } )
    expect( project_follow.userName ).toEqual( userName )
    expect( project_follow.userNumber ).toEqual( parseInt( userNumber ) )
    expect( project_follow.email ).toEqual( email )
    expect( project_follow.slug ).toEqual( slug )
    expect( project_follow.title ).toEqual( title )
  } )

  test( `valid constructor`, () => {
    const project_follow = new ProjectFollow( { userName, userNumber, email, slug, title, dateFollowed } )
    expect( project_follow.userName ).toEqual( userName )
    expect( project_follow.userNumber ).toEqual( parseInt( userNumber ) )
    expect( project_follow.email ).toEqual( email )
    expect( project_follow.slug ).toEqual( slug )
    expect( project_follow.title ).toEqual( title )
    expect( project_follow.dateFollowed ).toEqual( dateFollowed )
  } )

  test.each( invalidProjectFollows )(
    `invalid constructor`,
    parameter => expect( () => new ProjectFollow( parameter ) ).toThrow()
  )

  test( `pk`, () => {
    expect( new ProjectFollow( { userName, userNumber, email, slug, title } ).pk() ).toEqual( {
      'S': `USER#${ ZeroPadNumber( userNumber ) }`
    } )
  } )

  test( `key`, () => {
    expect( new ProjectFollow( { userName, userNumber, email, slug, title } ).key() ).toEqual( {
      'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
      'SK': { 'S': `#PROJECT#${ slug }` }
    } )
  } )

  test( `gsi1pk`, () => {
    expect( new ProjectFollow( { userName, userNumber, email, slug, title } ).gsi1pk() ).toEqual( {
      'S': `PROJECT#${ slug }`
    } )
  } )

  test( `gsi1`, () => {
    expect( new ProjectFollow( { userName, userNumber, email, slug, title, dateFollowed } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `PROJECT#${ slug }` },
      'GSI1SK': { 'S': `#PROJECT#${ dateFollowed.toISOString() }` }
    } )
  } )

  test( `toItem`, () => expect( new ProjectFollow( { userName, userNumber, email, slug, title, dateFollowed } ).toItem() ).toEqual( {
    'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
    'SK': { 'S': `#PROJECT#${ slug }` },
    'GSI1PK': { 'S': `PROJECT#${ slug }` },
    'GSI1SK': { 'S': `#PROJECT#${ dateFollowed.toISOString() }` },
    'Type': { 'S': `project follow` },
    'UserName': { 'S': userName },
    'Email': { 'S': email },
    'Title': { 'S': title },
    'DateFollowed': { 'S': dateFollowed.toISOString() }
  } ) )

  test( `projectFollowFromItem`, () => {
    const project_follow = new ProjectFollow( { userName, userNumber, email, slug, title, dateFollowed } )
    expect( projectFollowFromItem( project_follow.toItem() ) ).toEqual( project_follow )
  } )
} )
