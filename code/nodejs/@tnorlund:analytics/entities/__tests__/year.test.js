const { Year, yearFromItem } = require( `..` )

const slug = `/` 
const title = `Tyler Norlund`
const _year = 2021
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

const validYear = { slug, title, year: _year, numberVisitors, averageTime, percentChurn, fromPage, toPage }

const validYears = [
  { slug, title, year: _year, numberVisitors, averageTime, percentChurn, fromPage, toPage },
  { slug, title, year: _year, numberVisitors: numberVisitors.toString(), averageTime, percentChurn, fromPage, toPage },
  { slug, title, year: _year, numberVisitors, averageTime: averageTime.toString(), percentChurn, fromPage, toPage },
  { slug, title, year: _year, numberVisitors, averageTime, percentChurn: percentChurn.toString(), fromPage, toPage },
]

const invalidYears = [
  {},
  { slug },
  { slug, title },
  { slug, title, date: `something` },
  { slug, title, year: _year },
  { slug, title, year: _year, numberVisitors: `something` },
  { slug, title, year: _year, numberVisitors: `-1` },
  { slug, title, year: _year, numberVisitors },
  { slug, title, year: _year, numberVisitors, averageTime },
  { slug, title, year: _year, numberVisitors, averageTime: `something` },
  { slug, title, year: _year, numberVisitors, averageTime: `-1` },
  { slug, title, year: _year, numberVisitors, averageTime, percentChurn: `something` },
  { slug, title, year: _year, numberVisitors, averageTime, percentChurn: `-1` }
]

describe( `month object`, () => {
  test.each( validYears )(
    `valid constructor`,
    parameter => {
      const year = new Year( parameter )
      expect( year.slug ).toEqual( slug )
      expect( year.title ).toEqual( title )
      expect( year.year ).toEqual( _year )
      expect( year.numberVisitors ).toEqual( numberVisitors )
      expect( year.averageTime ).toEqual( averageTime )
      expect( year.percentChurn ).toEqual( percentChurn )
      expect( year.fromPage ).toEqual( fromPage )
      expect( year.toPage ).toEqual( toPage )
    }
  )

  test.each( invalidYears )( 
    `invalid constructor`,
    parameter => expect( () => new Year( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Year( validYear ).pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `key`, () => expect( new Year( validYear ).key() ).toEqual( {
    'PK': { 'S': `PAGE#${ slug }` },
    'SK': { 'S': `#YEAR#${ _year }` }
  } ) )

  test( `gsi1pk`, () => expect( new Year( validYear ).gsi1pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `gsi1`, () => expect( new Year( validYear ).gsi1() ).toEqual( {
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `#YEAR#${ _year }` }
  } ) )

  test( `toItem`, () => {
    const month = new Year( validYear )
    expect( month.toItem() ).toStrictEqual( {
      'PK': { 'S': `PAGE#${ slug }` },
      'SK': { 'S': `#YEAR#${ _year }` },
      'GSI1PK': { 'S': `PAGE#${ slug }` },
      'GSI1SK': { 'S': `#YEAR#${ _year }` },
      'Type': { 'S': `year` },
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
    } )
  } )

  test( `yearFromItem`, () => {
    const year = new Year( validYear )
    expect( yearFromItem( year.toItem() ) ).toStrictEqual( year )
  } )
} )