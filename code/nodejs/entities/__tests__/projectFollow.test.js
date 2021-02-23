const { ProjectFollow, projectFollowFromItem } = require( `..` )
const{ ZeroPadNumber } = require( `../utils` )

const name = `Tyler`
const username = `4ec5a264-733d-4ee5-b59c-7911539e3942`
const email = `someone@me.com`
const slug = `/`
const title = `Tyler Norlund`
const dateFollowed = new Date()

const invalidProjectFollows = [
  { username, email, slug, title },
  { username, email, slug, title },
  { username, name, slug, title },
  { username, name, email, title },
  { username, name, email, slug }
]

describe( `projectFollow object`, () => {
  test( `valid constructor`, () => {
    const project_follow = new ProjectFollow( {
      username, name, email, slug, title
    } )
    expect( project_follow.username ).toEqual( username )
    expect( project_follow.name ).toEqual( name )
    expect( project_follow.email ).toEqual( email )
    expect( project_follow.slug ).toEqual( slug )
    expect( project_follow.title ).toEqual( title )
  } )

  test( `valid constructor`, () => {
    const project_follow = new ProjectFollow( {
      username, name, email, slug, title, dateFollowed
    } )
    expect( project_follow.username ).toEqual( username )
    expect( project_follow.name ).toEqual( name )
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
    expect( new ProjectFollow( {
      username, name, email, slug, title
    } ).pk() ).toEqual( {
      'S': `USER#${ username }`
    } )
  } )

  test( `key`, () => {
    expect( new ProjectFollow( {
      username, name, email, slug, title
    } ).key() ).toEqual( {
      'PK': { 'S': `USER#${ username }` },
      'SK': { 'S': `#PROJECT#${ slug }` }
    } )
  } )

  test( `gsi1pk`, () => {
    expect( new ProjectFollow( {
      username, name, email, slug, title
    } ).gsi1pk() ).toEqual( {
      'S': `PROJECT#${ slug }`
    } )
  } )

  test( `gsi1`, () => {
    expect( new ProjectFollow( {
      username, name, email, slug, title, dateFollowed
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `PROJECT#${ slug }` },
      'GSI1SK': { 'S': `#PROJECT#${ dateFollowed.toISOString() }` }
    } )
  } )

  test( `toItem`, () => expect( new ProjectFollow( {
    username, name, email, slug, title, dateFollowed
  } ).toItem() ).toEqual( {
    'PK': { 'S': `USER#${ username }` },
    'SK': { 'S': `#PROJECT#${ slug }` },
    'GSI1PK': { 'S': `PROJECT#${ slug }` },
    'GSI1SK': { 'S': `#PROJECT#${ dateFollowed.toISOString() }` },
    'Type': { 'S': `project follow` },
    'Name': { 'S': name },
    'Email': { 'S': email },
    'Title': { 'S': title },
    'DateFollowed': { 'S': dateFollowed.toISOString() }
  } ) )

  test( `projectFollowFromItem`, () => {
    const project_follow = new ProjectFollow( {
      username, name, email, slug, title, dateFollowed
    } )
    expect( projectFollowFromItem( project_follow.toItem() ) ).toEqual(
      project_follow
    )
  } )
} )
