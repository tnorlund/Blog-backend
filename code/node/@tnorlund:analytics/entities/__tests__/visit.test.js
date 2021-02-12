const { Visit, visitFromItem } = require( `..` )

/** The date of the page visit */
const date = new Date()
/** The unique ID for each visitor */
const id = `171a0329-f8b2-499c-867d-1942384ddd5f`
/** The visitor's user number */
const user = 1
const title = `Tyler Norlund`
const slug = `/`
const sessionStart = new Date()

const validVisits = [
  { date, id, user, title, slug, sessionStart },
  { date: date.toISOString(), id, user, title, slug, sessionStart },
  { date, id, user, title, slug, sessionStart: sessionStart.toISOString() },
  { date, id, user, title, slug, sessionStart, timeOnPage: 10 },
  { date, id, user, title, slug, sessionStart, prevTitle: `Tyler Norlund` },
  { date, id, user, title, slug, sessionStart, prevSlug: `/` },
  { date, id, user, title, slug, sessionStart, nextTitle: `Tyler Norlund` },
  { date, id, user, title, slug, sessionStart, nextSlug: `/` }
]

const invalidVisits = [
  {},
  { date },
  { date, id },
  { date, id, user },
  { date, id, user, title },
  { date, id, user, title, slug }
]

describe( `visit object`, () => {
  test.each( validVisits )(
    `valid constructor`,
    parameter => {
      const visit = new Visit( parameter )
      expect( visit.date ).toEqual( date )
      expect( visit.id ).toEqual( id )
      expect( visit.user ).toEqual( user )
      expect( visit.title ).toEqual( title )
      expect( visit.slug ).toEqual( slug )
      expect( visit.sessionStart ).toEqual( sessionStart )
      expect( visit.timeOnPage ).toEqual( parameter.timeOnPage )
      expect( visit.prevTitle ).toEqual( parameter.prevTitle )
      expect( visit.prevSlug ).toEqual( parameter.prevSlug )
      expect( visit.nextTitle ).toEqual( parameter.nextTitle )
      expect( visit.nextSlug ).toEqual( parameter.nextSlug )
    }
  )

  test.each( invalidVisits )( 
    `invalid constructor`,
    parameter => expect( () => new Visit( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( 
    new Visit( { date, id, user, title, slug, sessionStart } ).pk() 
  ).toEqual( { 'S': `VISITOR#${ id }` } ) )

  test( `key`, () => expect( 
    new Visit( { date, id, user, title, slug, sessionStart } ).key() 
  ).toEqual( 
    {
      'PK': { 'S': `VISITOR#${ id }` },
      'SK': { 'S': `VISIT#${ date.toISOString() }#${ slug }` }
    } 
  ) )

  test( `gsi1pk`, () => expect( new Visit( { date, id, user, title, slug, sessionStart } ).gsi1pk() ).toEqual( {
    'S': `PAGE#${ slug }`
  } ) )

  test( `gsi1`, () => expect( new Visit( { date, id, user, title, slug, sessionStart } ).gsi1() ).toEqual( {
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `VISIT#${ date.toISOString() }` }
  } ) )

  test( `gsi2pk`, () => expect( new Visit( { date, id, user, title, slug, sessionStart } ).gsi2pk() ).toEqual( {
    'S': `SESSION#${ id }#${ sessionStart.toISOString() }`
  } ) )

  test( `gsi2`, () => expect( new Visit( { date, id, user, title, slug, sessionStart } ).gsi2() ).toEqual( {
    'GSI2PK': { 'S': `SESSION#${ id }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `VISIT#${ date.toISOString() }` }
  } ) )

  test( `toItem`, () => expect( new Visit( { date, id, user, title, slug, sessionStart } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ id }` },
    'SK': { 'S': `VISIT#${ date.toISOString() }#${ slug }` },
    'GSI1PK': { 'S': `PAGE#${ slug }` },
    'GSI1SK': { 'S': `VISIT#${ date.toISOString() }` },
    'GSI2PK': { 'S': `SESSION#${ id }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `VISIT#${ date.toISOString() }` },
    'Type': { 'S': `visit` },
    'User': { 'N': user.toString() },
    'Title': { 'S': title },
    'Slug': { 'S': slug },
    'PreviousTitle': { 'NULL': true },
    'PreviousSlug': { 'NULL': true },
    'NextTitle': { 'NULL': true },
    'NextSlug': { 'NULL': true },
    'TimeOnPage': { 'NULL': true }
  } ) )

  test( `visitFromItem`, () => {
    const visit = new Visit( { date, id, user, title, slug, sessionStart } )
    expect( visitFromItem( visit.toItem() ) ).toEqual( visit )
  } )

  test( `visitFromItem`, () => {
    const visit = new Visit( { date, id, user, title, slug, sessionStart, timeOnPage: `10`, prevTitle: `Tyler Norlund`, prevSlug: `/`, nextTitle: `Tyler Norlund`, nextSlug: `/` } )
    expect( visitFromItem( visit.toItem() ) ).toEqual( visit )
  } )

} )
