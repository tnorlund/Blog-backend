const { Blog, blogFromItem } = require( `..` )

const validBlogs = [
  {},
  { numberPosts: `0` },
  { numberProjects: `0` },
  { numberPosts: `0`, numberProjects: `0` },
  { numberUsers: `0` },
  { numberProjects: `0` },
  { numberUsers: `0`, numberProjects: `0` },
  { numberUsers: `0` },
  { numberPosts: `0` },
  { numberUsers: `0`, numberPosts: `0` },
]

const invalidBlogs = [
  { numberUsers: `-1` },
  { numberPosts: `-1` },
  { numberProjects: `-1` },
]

describe( `blog object`, () => {
  test.each( validBlogs )(
    `valid constructor`, 
    parameter => expect( new Blog( parameter ) ).toEqual( {
      numberUsers: 0, numberPosts: 0, numberProjects: 0
    } )
  )
  
  test.each( invalidBlogs )(
    `invalid constructor`,
    parameter => expect( () => new Blog( parameter ) ).toThrow()
  )
  
  test( `key`, () => {
    expect( new Blog( {} ).key() ).toEqual( {
      'PK': { 'S': `#BLOG` },
      'SK': { 'S': `#BLOG` }
    } )
  } )
  
  test( `toItem`, () => {
    const blog = new Blog( {} )
    expect( blog.toItem() ).toStrictEqual( {
      'PK': { 'S': `#BLOG` },
      'SK': { 'S': `#BLOG` },
      'Type': { 'S': `blog` },
      'NumberUsers': { 'N': `0` },
      'NumberPosts': { 'N': `0` },
      'NumberProjects': { 'N': `0` }
    } )
  } )
  
  test( `blogFromItem`, () => {
    const blog = new Blog( {} )
    expect( blogFromItem( blog.toItem() ) ).toStrictEqual( blog )
  } )
} )
