const { 
  ZeroPadNumber, parseDate, variableToItemAttribute 
} = require( `./utils` )
/**
 * User library
 */
class User {
  /**
   * A user object.
   * @param {object} options
   * @param {String} options.name The name of the user.
   * @param {Number|String} [options.userNumber=`0`] The number of the user.
   */
  constructor( {
    name, email, userNumber = `0`, dateJoined = new Date(),
    numberFollows = `0`, numberComments = `0`, numberVotes = `0`,
    totalKarma = `0`
  } ) {
    if ( typeof name == `undefined` ) throw Error( `Must give the user's name` )
    this.name = name
    if ( typeof email === `undefined` ) 
      throw Error( `Must give the user's email` )
    this.email = email
    if ( isNaN( userNumber ) )
      throw new Error( `User number must be a number` )
    if ( parseInt( userNumber ) < 0 )
      throw new Error( `User number must be positive` )
    this.userNumber = parseInt( userNumber )
    this.dateJoined = (
      ( typeof dateJoined == `string` ) ? parseDate( dateJoined ): dateJoined
    )
    if ( isNaN( numberFollows ) )
      throw new Error( `User number of follows must be a number` )
    if ( parseInt( numberFollows ) < 0 )
      throw new Error( `User number of follower must be positive` )
    this.numberFollows = parseInt( numberFollows )
    if ( isNaN( numberComments ) )
      throw new Error( `User number of comments must be a number` )
    if ( parseInt( numberComments ) < 0 )
      throw new Error( `User number of comments must be positive` )
    this.numberComments = parseInt( numberComments )
    if ( isNaN( numberVotes ) )
      throw new Error( `User number of votes must be a number` )
    if ( parseInt( numberVotes ) < 0 )
      throw new Error( `User number of votes must be positive` )
    this.numberVotes = parseInt( numberVotes )
    if ( isNaN( totalKarma ) ) 
      throw new Error( `User's karma must be a number` )
    this.totalKarma = parseInt( totalKarma )
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return variableToItemAttribute(
      `USER#${ ZeroPadNumber( this.userNumber ) }`
    )
  }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK':variableToItemAttribute(
        `USER#${ ZeroPadNumber( this.userNumber ) }`
      ),
      'SK': variableToItemAttribute( `#USER` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a User.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': variableToItemAttribute( `user` ),
      'Name': variableToItemAttribute( this.name ),
      'Email': variableToItemAttribute( this.email ),
      'DateJoined': variableToItemAttribute( this.dateJoined ),
      'NumberFollows': variableToItemAttribute( this.numberFollows ),
      'NumberComments': variableToItemAttribute( this.numberComments ),
      'NumberVotes': variableToItemAttribute( this.numberVotes ),
      'TotalKarma': variableToItemAttribute( this.totalKarma )
    }
  }
}

/**
 * Turns the user from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The user as a class.
 */
const userFromItem = ( item ) => {
  return new User( {
    name: item.Name.S,
    email: item.Email.S,
    userNumber: item.PK.S.split( `#` )[1],
    dateJoined: item.DateJoined.S,
    numberComments: item.NumberComments.N,
    numberVotes: item.NumberVotes.N,
    numberFollows: item.NumberFollows.N,
    totalKarma: item.TotalKarma.N
  } )
}

module.exports = { User, userFromItem }