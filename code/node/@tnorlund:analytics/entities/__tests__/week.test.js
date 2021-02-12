const { Week, weekFromItem } = require( `..` )

const slug = `/` 
const title = `Tyler Norlund`
const year = 2021
const _week = 10
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

const validWeek = { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime, percentChurn, fromPage, toPage }

const validWeeks = [
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime, percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors: numberVisitors.toString(), averageTime, percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime: averageTime.toString(), percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime, percentChurn: percentChurn.toString(), fromPage, toPage },
]

const invalidWeeks = [
  {},
  { slug },
  { slug, title },
  { slug, title, date: `something` },
  { slug, title, date: `${ year }-${ _week }` },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors: `something` },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors: `-1` },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime: `something` },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime: `-1` },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime, percentChurn: `something` },
  { slug, title, date: `${ year }-${ _week }`, numberVisitors, averageTime, percentChurn: `-1` }
]

describe( `week object`, () => {
  test.each( validWeeks )(
    `valid constructor`,
    parameter => {
      const week = new Week( parameter )
      expect( week.slug ).toEqual( slug )
      expect( week.title ).toEqual( title )
      expect( week.year ).toEqual( year )
      expect( week.week ).toEqual( _week )
      expect( week.numberVisitors ).toEqual( numberVisitors )
      expect( week.averageTime ).toEqual( averageTime )
      expect( week.percentChurn ).toEqual( percentChurn )
      expect( week.fromPage ).toEqual( fromPage )
      expect( week.toPage ).toEqual( toPage )
    }
  )

  test.each( invalidWeeks )( 
    `invalid constructor`,
    parameter => expect( () => new Week( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Week( validWeek ).pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `key`, () => expect( new Week( validWeek ).key() ).toEqual( {
    'PK': { 'S': `PAGE#${ slug }` },
    'SK': { 'S': `#WEEK#${ year }-${ _week }` }
  } ) )

  test( `gsi1pk`, () => expect( new Week( validWeek ).gsi1pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `gsi1`, () => expect( new Week( validWeek ).gsi1() ).toEqual( {
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `#WEEK#${ year }-${ _week }` }
  } ) )

  test( `toItem`, () => {
    const week = new Week( validWeek )
    expect( week.toItem() ).toStrictEqual( {
      'PK': { 'S': `PAGE#${ slug }` },
      'SK': { 'S': `#WEEK#${ year }-${ _week }` },
      'GSI1PK': { 'S': `PAGE#${ slug }` },
      'GSI1SK': { 'S': `#WEEK#${ year }-${ _week }` },
      'Type': { 'S': `week` },
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

  test( `weekFromItem`, () => {
    const week = new Week( validWeek )
    expect( weekFromItem( week.toItem() ) ).toStrictEqual( week )
  } )
} )