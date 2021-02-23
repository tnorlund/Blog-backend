const { 
  isUsername, parseDate, variableToItemAttribute
} = require( `./utils` )
class ProjectFollow {
  /**
   * A project's follow object.
   * @param {Object} details The details about the project's follow.
   */
  constructor( {
    username, name, email, slug, title, dateFollowed = new Date()
  } ) {
    if ( typeof username === `undefined` )
      throw Error( `Must give the user's username` )
    if ( !isUsername( username ) )
      throw Error( `Username must be formatted as UUID` )
    this.username = username
    if ( typeof name === `undefined` ) 
      throw Error( `Must give user's name` )
    this.name = name
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
      'Name': { 'S': this.name },
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
    username: item.PK.S.split( `#` )[1],
    name: item.Name.S,
    slug: item.GSI1PK.S.split( `#` )[1],
    email: item.Email.S,
    title: item.Title.S,
    dateFollowed: item.DateFollowed.S
  } )
}

module.exports = { ProjectFollow, projectFollowFromItem }