const { Day, dayFromItem } = require( `..` )

const slug = `/` 
const title = `Tyler Norlund`
const year = 2021
const month = 10
const _day = 13
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

const validDay = { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime, percentChurn, fromPage, toPage }

const validDays = [
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime, percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors: numberVisitors.toString(), averageTime, percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime: averageTime.toString(), percentChurn, fromPage, toPage },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime, percentChurn: percentChurn.toString(), fromPage, toPage },
]

const invalidDays = [
  {},
  { slug },
  { slug, title },
  { slug, title, date: `something` },
  { slug, title, date: `${ year }-${ month }-${ _day }` },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors: `something` },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors: `-1` },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime: `something` },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime: `-1` },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime, percentChurn: `something` },
  { slug, title, date: `${ year }-${ month }-${ _day }`, numberVisitors, averageTime, percentChurn: `-1` }
]

describe( `day object`, () => {
  test.each( validDays )(
    `valid constructor`,
    parameter => {
      const day = new Day( parameter )
      expect( day.slug ).toEqual( slug )
      expect( day.title ).toEqual( title )
      expect( day.year ).toEqual( year )
      expect( day.month ).toEqual( month )
      expect( day.day ).toEqual( _day )
      expect( day.numberVisitors ).toEqual( numberVisitors )
      expect( day.averageTime ).toEqual( averageTime )
      expect( day.percentChurn ).toEqual( percentChurn )
      expect( day.fromPage ).toEqual( fromPage )
      expect( day.toPage ).toEqual( toPage )
    }
  )

  test.each( invalidDays )( 
    `invalid constructor`,
    parameter => expect( () => new Day( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Day( validDay ).pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `key`, () => expect( new Day( validDay ).key() ).toEqual( {
    'PK': { 'S': `PAGE#${ slug }` },
    'SK': { 'S': `#DAY#${ year }-${ month }-${ _day }` }
  } ) )

  test( `gsi1pk`, () => expect( new Day( validDay ).gsi1pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `gsi1`, () => expect( new Day( validDay ).gsi1() ).toEqual( {
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `#DAY#${ year }-${ month }-${ _day }` }
  } ) )

  test( `toItem`, () => {
    const day = new Day( validDay )
    expect( day.toItem() ).toStrictEqual( {
      'PK': { 'S': `PAGE#${ slug }` },
      'SK': { 'S': `#DAY#${ year }-${ month }-${ _day }` },
      'GSI1PK': { 'S': `PAGE#${ slug }` },
      'GSI1SK': { 'S': `#DAY#${ year }-${ month }-${ _day }` },
      'Type': { 'S': `day` },
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

  test( `dayFromItem`, () => {
    const day = new Day( validDay )
    expect( dayFromItem( day.toItem() ) ).toStrictEqual( day )
  } )
} )