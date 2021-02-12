const { Month, monthFromItem } = require( `..` )

const slug = `/` 
const title = `Tyler Norlund`
const year = 2021
const _month = 10
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

const validMonth = { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime, percentChurn, fromPage, toPage }

const validMonths = [
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime, percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors: numberVisitors.toString(), averageTime, percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime: averageTime.toString(), percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime, percentChurn: percentChurn.toString(), fromPage, toPage },
]

const invalidMonths = [
  {},
  { slug },
  { slug, title },
  { slug, title, date: `something` },
  { slug, title, date: `${ year }-${ _month }` },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors: `something` },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors: `-1` },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime: `something` },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime: `-1` },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime, percentChurn: `something` },
  { slug, title, date: `${ year }-${ _month }`, numberVisitors, averageTime, percentChurn: `-1` }
]

describe( `month object`, () => {
  test.each( validMonths )(
    `valid constructor`,
    parameter => {
      const month = new Month( parameter )
      expect( month.slug ).toEqual( slug )
      expect( month.title ).toEqual( title )
      expect( month.year ).toEqual( year )
      expect( month.month ).toEqual( _month )
      expect( month.numberVisitors ).toEqual( numberVisitors )
      expect( month.averageTime ).toEqual( averageTime )
      expect( month.percentChurn ).toEqual( percentChurn )
      expect( month.fromPage ).toEqual( fromPage )
      expect( month.toPage ).toEqual( toPage )
    }
  )

  test.each( invalidMonths )( 
    `invalid constructor`,
    parameter => expect( () => new Month( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Month( validMonth ).pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `key`, () => expect( new Month( validMonth ).key() ).toEqual( {
    'PK': { 'S': `PAGE#${ slug }` },
    'SK': { 'S': `#MONTH#${ year }-${ _month }` }
  } ) )

  test( `gsi1pk`, () => expect( new Month( validMonth ).gsi1pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `gsi1`, () => expect( new Month( validMonth ).gsi1() ).toEqual( {
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `#MONTH#${ year }-${ _month }` }
  } ) )

  test( `toItem`, () => {
    const month = new Month( validMonth )
    expect( month.toItem() ).toStrictEqual( {
      'PK': { 'S': `PAGE#${ slug }` },
      'SK': { 'S': `#MONTH#${ year }-${ _month }` },
      'GSI1PK': { 'S': `PAGE#${ slug }` },
      'GSI1SK': { 'S': `#MONTH#${ year }-${ _month }` },
      'Type': { 'S': `month` },
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

  test( `monthFromItem`, () => {
    const month = new Month( validMonth )
    expect( monthFromItem( month.toItem() ) ).toStrictEqual( month )
  } )
} )