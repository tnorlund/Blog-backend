const { variableToItemAttribute } = require( `./utils` )

class Post {
  /**
   * A project object.
   * @param {Object} details The details of the project.
   */
  constructor( { slug, title, numberComments = `0` } ) {
    if ( typeof slug === `undefined` ) throw new Error( `Must give slug` )
    this.slug = slug
    if ( typeof title === `undefined` ) throw new Error( `Must give title` )
    this.title = title
    if ( parseInt( numberComments ) < 0 ) 
      throw new Error( `Number of comments must be positive` )
    this.numberComments = parseInt( numberComments )
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() { return variableToItemAttribute( `#POST` ) }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': variableToItemAttribute( `#POST` ),
      'SK': variableToItemAttribute( `POST#${ this.slug }` )
    }
  }

  /**
   * @returns {Object} The global secondary index partition key.
   */
  gsi1pk() { return variableToItemAttribute( `POST#${ this.slug }` ) }

  /**
   * @returns {Object} The global secondary index primary key.
   */
  gsi1() {
    return {
      'GSI1PK': variableToItemAttribute( `POST#${ this.slug }` ),
      'GSI1SK': variableToItemAttribute( `#POST` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Project.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      'Type': variableToItemAttribute( `post` ),
      'Slug': variableToItemAttribute( this.slug ),
      'Title': variableToItemAttribute( this.title ),
      'NumberComments': variableToItemAttribute( this.numberComments )
    }
  }
}

/**
 * Turns the post from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The post as a class.
 */
const postFromItem = ( item ) => {
  return new Post ( {
    slug: item.Slug.S,
    title: item.Title.S,
    numberComments: item.NumberComments.N
  } )
}

module.exports = { Post, postFromItem }