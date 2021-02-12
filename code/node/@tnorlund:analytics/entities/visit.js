const { parseDate, variableToItemAttribute } = require( `./utils` )

class Visit {
  constructor( {
    date, id, user, title, slug, sessionStart, timeOnPage = undefined,
    prevTitle = undefined, prevSlug = undefined, nextTitle = undefined,
    nextSlug = undefined
  } ) {
    if ( typeof date === `undefined` )
      throw new Error( `Must give date of visit` )
    this.date = ( typeof date == `string` ) ? parseDate( date ): date
    if ( typeof id === `undefined` )
      throw new Error( `Must give id` )
    this.id = id
    if ( typeof user === `undefined` )
      throw new Error( `Must give the user of the visit` )
    if ( parseInt( user ) < 0 )
      throw new Error( `The user cannot be negative` )
    this.user = parseInt( user )
    if ( typeof title === `undefined` )
      throw new Error( `Must give the title of the visit` )
    this.title = title
    if ( typeof slug === `undefined` )
      throw new Error( `Must give the slug of the visit` )
    this.slug = slug
    if ( typeof sessionStart === `undefined` )
      throw new Error( `Must give the session start of the visit` )
    this.sessionStart = ( typeof sessionStart === `string` ) ?
      parseDate( sessionStart ) : sessionStart
    this.timeOnPage = ( typeof timeOnPage === `undefined` ) ? 
      undefined : parseFloat( timeOnPage )
    this.prevTitle = prevTitle
    this.prevSlug = prevSlug
    this.nextTitle = nextTitle
    this.nextSlug = nextSlug
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return variableToItemAttribute( `VISITOR#${ this.id }` )
  }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': variableToItemAttribute( `VISITOR#${ this.id }` ),
      'SK': variableToItemAttribute(
        `VISIT#${ this.date.toISOString() }#${ this.slug }`
      )
    }
  }

  /**
   * @returns {Object} The first global secondary index partition key.
   */
  gsi1pk() {
    return variableToItemAttribute( `PAGE#${ this.slug }` )
  }

  /**
   * @returns {Object} The primary key.
   */
  gsi1() {
    return {
      'GSI1PK': variableToItemAttribute( `PAGE#${ this.slug }` ),
      'GSI1SK': variableToItemAttribute( `VISIT#${ this.date.toISOString() }` )
    }
  }

  /**
   * @returns {Object} The second global secondary index partition key.
   */
  gsi2pk() {
    return variableToItemAttribute( 
      `SESSION#${ this.id }#${ this.sessionStart.toISOString() }` 
    )
  }

  /**
   * @returns {Object} The second global secondary index partition key.
   */
  gsi2() {
    return {
      'GSI2PK': variableToItemAttribute( 
        `SESSION#${ this.id }#${ this.sessionStart.toISOString() }` 
      ),
      'GSI2SK': variableToItemAttribute( `VISIT#${ this.date.toISOString() }` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a visit.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      ...this.gsi2(),
      'Type': variableToItemAttribute( `visit` ),
      'User': variableToItemAttribute( this.user ),
      'Title': variableToItemAttribute( this.title ),
      'Slug': variableToItemAttribute( this.slug ),
      'PreviousTitle': variableToItemAttribute( this.prevTitle ),
      'PreviousSlug': variableToItemAttribute( this.prevSlug ),
      'NextTitle': variableToItemAttribute( this.nextTitle ),
      'NextSlug': variableToItemAttribute( this.nextSlug ),
      'TimeOnPage': variableToItemAttribute( this.timeOnPage )
    }
  }
}

/**
 * Turns the visit from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The visit as a class.
 */
const visitFromItem = ( item ) => {
  return new Visit( {
    date: item.SK.S.split( `#` )[1], 
    id: item.PK.S.split( `#` )[1], 
    user: item.User.N,
    title: item.Title.S,
    slug: item.Slug.S,
    sessionStart: item.GSI2PK.S.split( `#` )[2],
    timeOnPage: ( `N` in item.TimeOnPage ) ? item.TimeOnPage.N : undefined,
    prevTitle: ( `S` in item.PreviousTitle ) ?
      item.PreviousTitle.S : undefined,
    prevSlug: ( `S` in item.PreviousSlug ) ?
      item.PreviousSlug.S : undefined,
    nextTitle: ( `S` in item.NextTitle ) ? item.NextTitle.S : undefined,
    nextSlug: ( `S` in item.NextSlug ) ? item.NextSlug.S : undefined
  } )
}

module.exports = { Visit, visitFromItem }
