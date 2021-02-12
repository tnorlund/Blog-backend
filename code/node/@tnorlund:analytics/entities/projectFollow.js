const { 
  ZeroPadNumber, parseDate, variableToItemAttribute
} = require( `./utils` )
class ProjectFollow {
  /**
   * A project's follow object.
   * @param {Object} details The details about the project's follow.
   */
  constructor( {
    userName, userNumber, email, slug, title, dateFollowed = new Date()
  } ) {
    if ( typeof userName === `undefined` ) 
      throw Error( `Must give user's name` )
    this.userName = userName
    if ( typeof userNumber === `undefined` )
      throw Error( `Must give the user's number` )
    this.userNumber = parseInt( userNumber )
    if ( typeof email === `undefined` )
      throw Error( `Must give the user's email` )
    this.email = email
    if ( typeof slug === `undefined` ) 
      throw Error( `Must give the project's slug` )
    this.slug = slug
    if ( typeof title === `undefined` ) 
      throw Error( `Must give the project's title` )
    this.title = title
    this.dateFollowed = (
      ( typeof dateFollowed == `string` ) ? parseDate( dateFollowed )
        : dateFollowed
    )
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
      'PK': variableToItemAttribute(
        `USER#${ ZeroPadNumber( this.userNumber ) }`
      ),
      'SK': variableToItemAttribute( `#PROJECT#${ this.slug }` )
    }
  }

  /**
   * @returns {Object} The global secondary index partition key.
   */
  gsi1pk() {
    return variableToItemAttribute( `PROJECT#${ this.slug }` )
  }

  /**
   * @returns {Object} The global secondary index primary key.
   */
  gsi1() {
    return {
      'GSI1PK': variableToItemAttribute( `PROJECT#${ this.slug }` ),
      'GSI1SK': variableToItemAttribute(
        `#PROJECT#${ this.dateFollowed.toISOString() }`
      )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a project's follow.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      'Type': { 'S': `project follow` },
      'UserName': { 'S': this.userName },
      'Email': { 'S': this.email },
      'Title': { 'S': this.title },
      'DateFollowed': { 'S': this.dateFollowed.toISOString() }
    }
  }
}

/**
 * Turns the project's follow from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The project's follow as a class.
 */
const projectFollowFromItem = ( item ) => {
  return new ProjectFollow( {
    userName: item.UserName.S,
    userNumber: parseInt( item.PK.S.split( `#` )[1] ).toString(),
    slug: item.GSI1PK.S.split( `#` )[1],
    email: item.Email.S,
    title: item.Title.S,
    dateFollowed: item.DateFollowed.S
  } )
}

module.exports = { ProjectFollow, projectFollowFromItem }