const { isUsername, parseDate } = require( `./utils` )
class Vote {
  constructor( {
    username, 
    name, 
    slug, 
    voteNumber, 
    up, 
    dateAdded = new Date(), 
    replyChain = []
  } ) {
    if ( typeof username === `undefined` )
      throw Error( `Must give the user's username` )
    if ( !isUsername( username ) )
      throw Error( `Username must be formatted as UUID` )
    this.username = username
    if ( typeof name === `undefined` )
      throw new Error( `Must give the vote owner's name` )
    this.name = name
    if ( typeof slug === `undefined` ) 
      throw new Error( `Must give post's slug` )
    this.slug = slug
    if ( typeof voteNumber === `undefined` )
      throw new Error( `Must give the vote's number` )
    if ( isNaN( voteNumber ) )
      throw new Error( `Vote number must be a number` )
    if ( parseInt( voteNumber ) < 0 )
      throw new Error( `Vote number must be positive` )
    this.voteNumber = parseInt( voteNumber )
    if ( typeof up === `undefined` )
      throw new Error( 
        `Must give whether the vote is and up-vote or a down-vote` 
      )
    this.up = up
    this.dateAdded = ( typeof dateAdded === `string` ) ?
      parseDate( dateAdded ) : dateAdded
    if ( !Array.isArray( replyChain ) )
      throw new Error( `Chain of comments must be an array.` )
    if ( replyChain.length < 1 )
      throw new Error( `Vote requires a chain of comments` )
    this.replyChain = replyChain.map( ( date ) => {
      if ( typeof date == `string` ) return parseDate( date )
      else if ( date instanceof Date ) return date
      else throw new Error(
        `The chain of comments this replies to must be either strings or dates`
      )
    } )
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return {
      'S': `USER#${ this.username }`
    }
  }

  /**
   * @returns {Object} The primary key
   */
  key() {
    return {
      'PK': { 'S': `USER#${ this.username }` },
      'SK': { 'S': `#VOTE#${ this.dateAdded.toISOString() }` }
    }
  }

  /**
   * @returns {Object} The first global secondary index primary key
   */
  gsi1pk() { return { 'S': `POST#${ this.slug }` } }

  /**
   * @returns {Object} The first global secondary index primary key
   */
  gsi1() {
    return {
      'GSI1PK': { 'S': `POST#${ this.slug }` },
      'GSI1SK': {
        'S': `#COMMENT#`
        + this.replyChain.map( ( date ) => date.toISOString() )
          .join( `#COMMENT#` ) + `#VOTE#${ this.dateAdded.toISOString() }`
      }
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Vote.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      'Type': { 'S': `vote` },
      'Name': { 'S': this.name },
      'Slug': { 'S': this.slug },
      'VoteNumber': { 'N': this.voteNumber.toString() },
      'Up': { 'BOOL': this.up },
      'DateAdded': { 'S': this.dateAdded.toISOString() }
    }
  }

}

/**
 * Turns the vote form a DynamoDB item into the object.
 * @param   {Object} item The item returned from DynamoDB
 * @returns {Object}      The vote as an object.
 */
const voteFromItem = ( item ) => {
  return new Vote( {
    username: item.PK.S.split( `#` )[1],
    name: item.Name.S,
    slug: item.Slug.S,
    voteNumber: item.VoteNumber.N,
    up: item.Up.BOOL,
    dateAdded: item.GSI1SK.S.match(
      /#VOTE#(\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)/gm
    ).map( date => date.split( `#` )[2] )[0],
    replyChain: item.GSI1SK.S.match(
      /#COMMENT#(\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)/gm
    ).map(
      ( date ) => date.split( `#` )[2]
    )
  } )
}

module.exports = { Vote, voteFromItem }