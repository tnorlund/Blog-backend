const { 
  variableToItemAttribute, mappingToObject, ZeroPadNumber 
} = require( `./utils` )

class Year {
  /**
   * A week object.
   * @param {Object} details The details of the week.
   */
  constructor( {
    slug, title, year, numberVisitors, averageTime, percentChurn, fromPage,
    toPage
  } ) {
    if ( typeof slug === `undefined` )
      throw new Error( `Must give slug` )
    this.slug = slug
    if ( typeof title === `undefined` )
      throw new Error( `Must give title` )
    this.title = title
    if ( typeof year === `undefined` )
      throw new Error( `Must give year` )
    this.year = parseInt( year )
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
      'SK': variableToItemAttribute( `#YEAR#${ 
        ZeroPadNumber( this.year, 4 ) }` )
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
      'GSI1SK': variableToItemAttribute( `#YEAR#${ 
        ZeroPadNumber( this.year, 4 ) }` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a day.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      'Type': variableToItemAttribute( `year` ),
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

const yearFromItem = ( item ) => {
  return new Year( {
    slug: item.Slug.S, 
    title: item.Title.S, 
    year: item.SK.S.split( `#` )[ 2 ],
    numberVisitors: item.NumberVisitors.N, 
    averageTime: item.AverageTime.N, 
    percentChurn: item.PercentChurn.N, 
    fromPage: mappingToObject( item.FromPage.M ), 
    toPage: mappingToObject( item.ToPage.M )
  } )
}

module.exports = { Year, yearFromItem }