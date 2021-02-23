const {
  isUsername, parseDate, variableToItemAttribute
} = require( `./utils` )

class TOS {
  /**
   * A Terms of Service object.
   * @param {Object} details The details of the Terms of Service.
   */
  constructor( { username, version, dateAccepted = new Date() } ) {
    if ( typeof username === `undefined` )
      throw Error( `Must give the user's username` )
      if ( !isUsername( username ) )
      throw Error( `Username must be formatted as UUID` )
    this.username = username
    if ( typeof version === `undefined` )
      throw Error( `Must give terms of service's version` )
    this.version = ( typeof version == `string` ) ?
      parseDate( version ) : version
    this.dateAccepted =  ( typeof dateAccepted == `string` ) ?
      parseDate( dateAccepted ) : dateAccepted
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return variableToItemAttribute(
      `USER#${ this.username }`
    )
  }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': variableToItemAttribute(
        `USER#${ this.username }`
      ),
      'SK': variableToItemAttribute(
        `#TOS#${ this.version.toISOString() }`
      )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Terms of Service.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': variableToItemAttribute( `terms of service` ),
      'DateAccepted': variableToItemAttribute( this.dateAccepted )
    }
  }
}

/**
 * Turns the terms of service from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB
 * @returns {Object}      The Terms of Service as a class.
 */
const tosFromItem = ( item ) => {
  return new TOS( {
    username: item.PK.S.split( `#` )[1],
    version: parseDate( item.SK.S.split( `#` )[2] ),
    dateAccepted: parseDate( item.DateAccepted.S )
  } )
}

module.exports = { TOS, tosFromItem }