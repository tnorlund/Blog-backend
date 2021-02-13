const { 
  variableToItemAttribute, mappingToObject, ZeroPadNumber 
} = require( `./utils` )

class Week {
  /**
   * A week object.
   * @param {Object} details The details of the week.
   */
  constructor( {
    slug, title, date, numberVisitors, averageTime, percentChurn, fromPage,
    toPage
  } ) {
    if ( typeof slug === `undefined` )
      throw new Error( `Must give slug` )
    this.slug = slug
    if ( typeof title === `undefined` )
      throw new Error( `Must give title` )
    this.title = title
    if ( typeof date === `undefined` )
      throw new Error( `Must give date` )
    const date_match = date.match( /([0-9]+)-([0-9]+)/ )
    if ( !date_match )
      throw new Error( `Date must be given as <year>-<week>` )
    this.year = parseInt( date_match[ 1 ] )
    this.week = parseInt( date_match[ 2 ] )
    if ( typeof numberVisitors === `undefined` )
      throw new Error( `Must give the number of visitors` )
    if ( isNaN( numberVisitors ) )
      throw new Error( `Number of visitors must be a number` )
    if ( parseInt( numberVisitors ) < 0 )
      throw new Error( `Number of visitors must be a positive number` )
    this.numberVisitors = parseFloat( numberVisitors )
    if ( typeof averageTime === `undefined` )
      throw new Error( `Must give the average time on page` )
    if ( isNaN( averageTime ) )
      throw new Error( `Average time on page must be a number` )
    if ( parseFloat( averageTime ) < 0 )
      throw new Error( `Average time on page must be a positive number` )
    this.averageTime = parseFloat( averageTime )
    if ( typeof percentChurn === `undefined` )
      throw new Error( `Must give the percent churn` )
    if ( isNaN( percentChurn ) )
      throw new Error( `Percent churn must be a number` )
    if ( parseFloat( percentChurn ) < 0 )
      throw new Error( `Percent churn must be a positive number` )
    this.percentChurn = parseFloat( percentChurn )
    this.fromPage = fromPage
    this.toPage = toPage
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return variableToItemAttribute( `PAGE#${ this.slug }` )
  }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': variableToItemAttribute( `PAGE#${ this.slug }` ),
      'SK': variableToItemAttribute( `#WEEK#${ 
        ZeroPadNumber( this.year, 4 ) }-${ ZeroPadNumber( this.week, 2 ) }` )
    }
  }

  /**
   * @returns {Object} The first global secondary index primary key
   */
  gsi1pk() {
    return variableToItemAttribute( `PAGE#${ this.slug }` )
  }

  /**
   * @returns {Object} The first global secondary index primary key
   */
  gsi1() {
    return {
      'GSI1PK': variableToItemAttribute( `PAGE#${ this.slug }` ),
      'GSI1SK': variableToItemAttribute( `#WEEK#${ 
        ZeroPadNumber( this.year, 4 ) }-${ ZeroPadNumber( this.week, 2 ) }` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a day.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      'Type': variableToItemAttribute( `week` ),
      'Title': variableToItemAttribute( this.title ),
      'Slug': variableToItemAttribute( this.slug ),
      'NumberVisitors': variableToItemAttribute( this.numberVisitors ),
      'AverageTime': variableToItemAttribute( this.averageTime ),
      'PercentChurn': variableToItemAttribute( this.percentChurn ),
      'FromPage': variableToItemAttribute( this.fromPage ),
      'ToPage': variableToItemAttribute( this.toPage )
    }
  }
}

const weekFromItem = ( item ) => {
  return new Week( {
    slug: item.Slug.S, 
    title: item.Title.S, 
    date: item.SK.S.split( `#` )[ 2 ],
    numberVisitors: item.NumberVisitors.N, 
    averageTime: item.AverageTime.N, 
    percentChurn: item.PercentChurn.N, 
    fromPage: mappingToObject( item.FromPage.M ), 
    toPage: mappingToObject( item.ToPage.M )
  } )
}

module.exports = { Week, weekFromItem }