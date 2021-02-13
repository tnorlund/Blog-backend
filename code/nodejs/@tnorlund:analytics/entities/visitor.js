class Visitor {
  /**
   * The visitor constructor.
   * @param {Object} details The visitor's details.
   * @param {String} details.id The visitor's unique ID.
   * @param {Number} details.numberSessions The number of sessions the visitor
   *   has had with the website.
   */
  constructor( {
    id, numberSessions = 0,
  } ) {
    if ( typeof id === `undefined` )
      throw new Error( `Must give id` )
    this.id = id
    if ( isNaN( numberSessions ) )
      throw new Error( `Number of sessions must be a number` )
    if ( parseInt( numberSessions ) < 0 )
      throw new Error( `Number of sessions must be positive` )
    this.numberSessions = parseInt( numberSessions )
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return {
      'S': `VISITOR#${ this.id }`
    }
  }

  /**
   * @returns {Object} The primary key
   */
  key() {
    return {
      'PK': { 'S': `VISITOR#${ this.id }` },
      'SK': { 'S': `#VISITOR` }
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Visitor.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': { 'S': `visitor` },
      'NumberSessions': { 'N': this.numberSessions.toString() },
    }
  }
}

/**
 * Turns the visitor form a DynamoDB item into the object.
 * @param   {Object} item The item returned from DynamoDB
 * @returns {Object}      The visitor as an object.
 */
const visitorFromItem = ( item ) => {
  return new Visitor( {
    id: item.PK.S.split( `#` )[1],
    numberSessions: item.NumberSessions.N
  } )
}

module.exports = { Visitor, visitorFromItem }