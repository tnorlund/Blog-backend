const { Project, projectFromItem } = require( `..` )

const slug = `/`
const title = `Tyler Norlund`

const validProjects = [
  { slug, title },
  { slug, title, numberFollows: `0` },
  { slug, title, numberFollows: 0 }
]

const invalidProjects = [
  { title },
  { slug },
  { slug, title, numberFollows: `-1` },
  { slug, title, numberFollows: -1 },
]

describe( `project object`, () => {
  test.each( validProjects )(
    `valid constructor`, 
    parameter => {
      const project = new Project( parameter )
      expect( project.slug ).toEqual( slug )
      expect( project.title ).toEqual( title )
      expect( project.numberFollows ).toEqual( 0 )
    }
  )

  test.each( invalidProjects )(
    `invalid constructor`,
    parameter => expect( () => new Project( parameter ) ).toThrow()
  )

  test( `pk`, () => {
    expect( new Project( { slug, title  } ).pk() ).toEqual( { 'S': `#PROJECT` } )
  } )

  test( `key`, () => {
    expect( new Project( { slug, title } ).key() ).toEqual( {
      'PK': { 'S': `#PROJECT` },
      'SK': { 'S': `PROJECT#${ slug }` }
    } )
  } )

  test( `gsi1pk`, () => {
    expect( new Project( { slug, title } ).gsi1pk() ).toEqual( { 'S': `PROJECT#${ slug }` } )
  } )

  test( `gsi1`, () => {
    expect( new Project( { slug, title } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `PROJECT#${ slug }` },
      'GSI1SK': { 'S': `#PROJECT` }
    } )
  } )

  test( `toItem`, () => expect( new Project( { slug, title } ).toItem() ).toEqual( {
    'PK': { 'S': `#PROJECT` },
    'SK': { 'S': `PROJECT#${ slug }` },
    'GSI1PK': { 'S': `PROJECT#${ slug }` },
    'GSI1SK': { 'S': `#PROJECT` },
    'Type': { 'S': `project` },
    'Slug': { 'S': slug },
    'Title': { 'S': title },
    'NumberFollows': { 'N': `0` }
  } ) )

  test( `projectFromItem`, () => {
    const project = new Project( { slug, title} )
    expect( projectFromItem( project.toItem() ) ).toStrictEqual( project )
  } )
} )
