const { variableToItemAttribute } = require( `./utils` )

class Project {
  /**
   * A project object.
   * @param {Object} details The details of the project.
   */
  constructor( { slug, title, numberFollows = `0` } ) {
    if ( !slug ) throw Error( `Must give slug` )
    this.slug = slug
    if ( !title ) throw Error( `Must give title` )
    this.title = title
    if ( parseInt( numberFollows ) < 0 ) 
      throw new Error( `Number of follows must be positive` )
    this.numberFollows = parseInt( numberFollows )
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() { return variableToItemAttribute( `#PROJECT` ) }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': variableToItemAttribute( `#PROJECT` ),
      'SK': variableToItemAttribute( `PROJECT#${ this.slug }` )
    }
  }

  /**
   * @returns {Object} The global secondary index partition key.
   */
  gsi1pk() { return variableToItemAttribute( `PROJECT#${ this.slug }` ) }

  /**
   * @returns {Object} The global secondary index primary key.
   */
  gsi1() {
    return {
      'GSI1PK': variableToItemAttribute( `PROJECT#${ this.slug }` ),
      'GSI1SK': variableToItemAttribute( `#PROJECT` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Project.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      'Type': variableToItemAttribute( `project` ),
      'Slug': variableToItemAttribute( this.slug ),
      'Title': variableToItemAttribute( this.title ),
      'NumberFollows': variableToItemAttribute( this.numberFollows )
    }
  }
}

/**
 * Turns the project from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The project as a class.
 */
const projectFromItem = ( item ) => {
  return new Project ( {
    slug: item.Slug.S,
    title: item.Title.S,
    numberFollows: item.NumberFollows.N
  } )
}

module.exports = { Project, projectFromItem }