const { Post, postFromItem } = require( `..` )

const slug = `/`
const title = `Tyler Norlund`

const validPosts = [
  { slug, title },
  { slug, title, numberComments: `0` }
]

const invalidPosts = [
  { slug },
  { title },
  { slug, title, numberComments: `-1` }
]

describe( `post object`, () => {
  test.each( validPosts )(
    `valid constructor`,
    parameter => {
      const post = new Post( parameter )
      expect( post.slug ).toEqual( slug )
      expect( post.title ).toEqual( title )
      expect( post.numberComments ).toEqual( 0 )
    }
  )

  test.each( invalidPosts )(
    `invalid constructor`,
    parameter => expect( () => new Post( parameter ) ).toThrow()
  )

  test( `pk`, () => {
    expect( new Post( { slug, title } ).pk() ).toEqual( {
      'S': `#POST`
    } )
  } )

  test( `key`, () => {
    expect( new Post( { slug, title } ).key() ).toEqual( {
      'PK': { 'S': `#POST` },
      'SK': { 'S': `POST#${ slug }` }
    } )
  } )

  test( `gsi1pk`, () => {
    expect( new Post( { slug, title } ).gsi1pk() ).toEqual( {
      'S': `POST#${ slug }`
    } )
  } )

  test( `gsi1`, () => {
    expect( new Post( { slug, title } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#POST` }
    } )
  } )

  test( `toItem`, () => expect( new Post( { slug, title } ).toItem() ).toEqual( {
    'PK': { 'S': `#POST` },
    'SK': { 'S': `POST#${ slug }` },
    'GSI1PK': { 'S': `POST#${ slug }` },
    'GSI1SK': { 'S': `#POST` },
    'Type': { 'S': `post` },
    'Slug': { 'S': slug },
    'Title': { 'S': title },
    'NumberComments': { 'N': `0` }
  } ) )

  test( `postFromItem`, () => {
    const post = new Post( { slug, title } )
    expect( postFromItem( post.toItem() ) ).toStrictEqual( post )
  } )
} )