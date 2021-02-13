const { parseDate, variableToItemAttribute } = require( `./utils` )

class Session {
  /**
   * A session object.
   * @param {Object} details The details of the session.
   */
  constructor( { sessionStart, id, avgTime, totalTime } ) {
    if ( typeof sessionStart === `undefined` )
      throw new Error( `Must give the session start` )
    this.sessionStart = ( typeof sessionStart === `string` ) ?
      parseDate( sessionStart ) : sessionStart
    if ( typeof id === `undefined` )
      throw new Error( `Must give ID` )
    this.id = id
    this.avgTime = ( typeof avgTime === `undefined` ) ? 
      undefined : parseFloat( avgTime )
    this.totalTime = ( typeof totalTime === `undefined` ) ? 
      undefined : parseFloat( totalTime )
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
        `SESSION#${ this.sessionStart.toISOString() }`
      )
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
      'GSI2SK': variableToItemAttribute( `#SESSION` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a session.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi2(),
      'Type': variableToItemAttribute( `session` ),
      'AverageTime': variableToItemAttribute( this.avgTime ),
      'TotalTime': variableToItemAttribute( this.totalTime ),
    }
  }
}

/**
 * Turns the session from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The session as a class.
 */
const sessionFromItem = ( item ) => {
  return new Session( {
    sessionStart: item.GSI2PK.S.split( `#` )[2], 
    id: item.PK.S.split( `#` )[1], 
    avgTime: ( `N` in item.AverageTime ) ? item.AverageTime.N : undefined, 
    totalTime: ( `N` in item.TotalTime ) ? item.TotalTime.N : undefined
  } )
}

module.exports = { Session, sessionFromItem }
