const { Page, pageFromItem } = require( `..` )

const slug = `/` 
const title = `Tyler Norlund`
const numberVisitors = 100
const averageTime = 60.0
const percentChurn = 0.75
const fromPage = {
  'www': 0.2,
  '/projects/web/analytics': 0.2,
  '/projects/web': 0.6
}
const toPage = {
  '/': 0.2,
  '/projects': 0.2,
  '/projects/vhs': 0.2,
  '/projects/web/analytics': 0.2,
  '/projects/web/styling-the-website': 0.2,
}

const validPages = [
  { slug, title, numberVisitors, averageTime, percentChurn, fromPage, toPage },
  { slug, title, numberVisitors: numberVisitors.toString(), averageTime, percentChurn, fromPage, toPage },
  { slug, title, numberVisitors, averageTime: averageTime.toString(), percentChurn, fromPage, toPage },
  { slug, title, numberVisitors, averageTime, percentChurn: percentChurn.toString(), fromPage, toPage },
]

const invalidPages = [
  {},
  { slug },
  { slug, title },
  { slug, title, numberVisitors },
  { slug, title, numberVisitors: `something` },
  { slug, title, numberVisitors: `-1` },
  { slug, title, numberVisitors, averageTime },
  { slug, title, numberVisitors, averageTime: `something` },
  { slug, title, numberVisitors, averageTime: `-1` },
  { slug, title, numberVisitors, averageTime, percentChurn: `something` },
  { slug, title, numberVisitors, averageTime, percentChurn: `-1` },

]

describe( `page object`, () => {
  test.each( validPages )(
    `valid constructor`,
    parameter => {
      const page = new Page( parameter )
      expect( page.slug ).toEqual( slug )
      expect( page.title ).toEqual( title )
      expect( page.numberVisitors ).toEqual( numberVisitors )
      expect( page.averageTime ).toEqual( averageTime )
      expect( page.percentChurn ).toEqual( percentChurn )
      expect( page.fromPage ).toEqual( fromPage )
      expect( page.toPage ).toEqual( toPage )
    }
  )

  test.each( invalidPages )( 
    `invalid constructor`,
    parameter => expect( () => new Page( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Page( { slug, title, numberVisitors, averageTime, percentChurn, fromPage, toPage } ).pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `key`, () => expect( new Page( { slug, title, numberVisitors, averageTime, percentChurn, fromPage, toPage } ).key() ).toEqual( {
    'PK': { 'S': `PAGE#${ slug }` },
    'SK': { 'S': `#PAGE` }
  } ) )

  test( `gsi1pk`, () => expect( new Page( { slug, title, numberVisitors, averageTime, percentChurn, fromPage, toPage } ).gsi1pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `gsi1`, () => expect( new Page( { slug, title, numberVisitors, averageTime, percentChurn, fromPage, toPage } ).gsi1() ).toEqual( {
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `#PAGE` }
  } ) )

  test( `toItem`, () => expect( new Page( { slug, title, numberVisitors, averageTime, percentChurn, fromPage, toPage } ).toItem() ).toEqual( { 
    'PK': { 'S': `PAGE#${ slug }` },
    'SK': { 'S': `#PAGE` },
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `#PAGE` },
    'Type': { 'S': `page` },
    'Title': { 'S': title },
    'Slug': { 'S': slug },
    'NumberVisitors': { 'N': numberVisitors.toString() },
    'AverageTime': { 'N': averageTime.toString() },
    'PercentChurn': { 'N': percentChurn.toString() },
    'FromPage': { 'M': {
      'www': { 'N': `0.2` },
      '/projects/web/analytics': { 'N': `0.2` },
      '/projects/web': { 'N': `0.6` },
    } },
    'ToPage': { 'M': {
      '/': { 'N': `0.2` },
      '/projects': { 'N': `0.2` },
      '/projects/vhs': { 'N': `0.2` },
      '/projects/web/analytics': { 'N': `0.2` },
      '/projects/web/styling-the-website': { 'N': `0.2` },
    } }
  } ) )

  test( `pageFromItem`, () => {
    const page = new Page( { slug, title, numberVisitors, averageTime, percentChurn, fromPage, toPage } )
    expect( pageFromItem( page.toItem() ) ).toStrictEqual( page )
  } )
} )
