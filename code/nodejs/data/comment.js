const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { 
  incrementNumberUserComments, incrementNumberUserVotes 
} = require( `./user` )
const { 
  aggregateData, 
  aggregateDataToTransact, 
  executeTransactWrite 
} = require( `./utils` )
const { incrementNumberPostComments, getPostDetails } = require( `./post` )
const { Comment, Vote, commentFromItem, Post } = require( `../entities` )

/**
 * Adds a comment to a post.
 * @param {String} tableName  The name of the DynamoDB table.
 * @param {Object} user       The user adding the comment.
 * @param {Object} post       The post the user is adding the comment to.
 * @param {String} text       The text of the comment.
 * @param {Array}  replyChain The set of dates the comment is replying to.
 * @returns {commentResponse} The result of accessing the database.
 */
const addComment = async ( tableName, user, post, text, replyChain ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  if ( typeof post == `undefined` ) throw new Error( `Must give post` )
  if ( typeof text == `undefined` ) 
    throw new Error( `Must give the text of the comment` )
  // The new comment needs to be given an up-vote. After incrementing the
  // number of comments the post and user has, increment the number of votes
  // the user has.
  const user_response = await incrementNumberUserComments( tableName, user )
  if ( user_response.error ) return user_response
  const post_response = await incrementNumberPostComments( tableName, post )
  if ( post_response.error ) return post_response
  const vote_response = await incrementNumberUserVotes( tableName, user )
  if ( vote_response.error ) return vote_response
  let comment, vote
  // Create the comment and vote.
  if ( typeof replyChain == `undefined` ) {
    comment = new Comment( {
      userNumber: user_response.user.userNumber,
      userCommentNumber: user_response.user.numberComments,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      postCommentNumber: post_response.post.numberComments,
      text,
      vote: 1,
      numberVotes: 1
    } )
    vote = new Vote( {
      userNumber: user_response.user.userNumber,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      replyChain: [ comment.dateAdded.toISOString() ],
      commentDate: comment.dateAdded.dateAdded,
      up: true,
      voteNumber: 1
    } )
  } else {
    comment = new Comment( {
      userNumber: user_response.user.userNumber,
      userCommentNumber: user_response.user.numberComments,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      postCommentNumber: post_response.post.numberComments,
      vote: 1,
      numberVotes: 1,
      text, 
      replyChain: replyChain
    } )
    vote = new Vote( {
      userNumber: user_response.user.userNumber,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      replyChain: [ ...replyChain, comment.dateAdded.toISOString() ],
      up: true,
      voteNumber: 1,
    } )
  }
  const params = {
    TransactItems: [
      { Put: {
        TableName: tableName,
        Item: comment.toItem(),
        ConditionExpression: `attribute_not_exists(PK)`
      } },
      { Put: {
        TableName: tableName,
        Item: vote.toItem(),
        ConditionExpression: `attribute_not_exists(PK)`
      } }
    ]
  }
  try {
    await executeTransactWrite( { client: dynamoDB, params } )
    return { comment, vote }
  } catch ( error ) {
    let errorMessage = `Could not add comment to post`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Comment already in database`
    return { error: errorMessage }
  }
}

/**
 * Retrieves the comment from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} comment   The comment requested.
 */
const getComment = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` )
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName,
      Key: comment.key()
    } ).promise()
    if ( !result.Item ) return { error: `Comment does not exist` }
    else return { comment: commentFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not get comment`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Removes a comment and its details from the table
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} comment   The comment request to remove from the table.
 */
const removeComment = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` )
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  const post = new Post( { slug: comment.slug, title: `` } )
  const result = await getPostDetails( tableName, post )
  if ( result.error ) return result
  const comment_to_delete = _commentFromDetails( 
    result.comments, comment, comment.replyChain 
  )
  // The user data and votes must be aggregated before making the single query.
  let aggregate_data = {}
  aggregate_data[`vote`] = []
  aggregate_data[`comment`] = []
  aggregate_data[`user`] = {}
  // console.log( `comment_to_delete`, comment_to_delete )
  aggregate_data = aggregateData( comment_to_delete, aggregate_data )
  const transact_items = aggregateDataToTransact( aggregate_data, tableName )
  // Decrement the number of comments the post has
  transact_items.push( {
    Update: {
      TableName: tableName,
      Key: post.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: 
        `SET #comments = #comments - :comment_dec`,
      ExpressionAttributeNames: { 
        '#comments': `NumberComments`,
      },
      ExpressionAttributeValues: { 
        ':comment_dec': { 'N': `${aggregate_data.comment.length}` }
      }
    }
  } )
  try {
    // transactWriteItems is limited to 25 requests per write operation.
    if ( transact_items.length <= 25 )
      await dynamoDB.transactWriteItems( { 
        TransactItems: transact_items 
      } ).promise()
    else {
      let i, j
      for ( i = 0, j = transact_items.length; i < j; i += 25 ) {
        await dynamoDB.transactWriteItems( { 
          TransactItems: transact_items.slice( i, i + 25 ) 
        } ).promise()
      }
    }
    return comment
  } catch( error ) {
    return { 'error': `Could not remove comment` }
  }
}

/**
 * Gets the unique comment from the post's details using the chain of replies.
 * @param {{Object}} comments   The comments, votes, and replies from the post.
 * @param {Object}   comment    The comment to find.
 * @param {[String]} replyChain The array of date-times the unique comment is
 *                              associated with.
 */
const _commentFromDetails = ( comments, comment, replyChain ) => {
  if ( replyChain.length > 0 ) {
    const date = replyChain.shift()
    return _commentFromDetails( 
      comments[ date.toISOString() ].replies, comment, replyChain 
    )
  } else { return comments[ comment.dateAdded.toISOString() ] }
}

/**
* Increments the number of votes a comment has.
* @param {String} tableName  The name of the DynamoDB table.
* @param {Object} comment    The comment to increment the number of votes.
* @returns {commentResponse} The result of incrementing the number of votes
*                            the comment has.
*/
const incrementNumberCommentVotes = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    // Set the number of votes the comment has to the value returned by the
    // database.
    comment.numberVotes = parseInt( response.Attributes.NumberVotes.N )
    return { comment }
  } catch( error ) {
    let errorMessage = `Could not increment the number of votes the comment `
    + `has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error : errorMessage }
  }
}

/**
* Decrements the number of votes a comment has.
* @param {String} tableName The name of the DynamoDB table.
* @param {Object} comment   The comment to decrement the number of votes.
* @returns {Map}            The result of decrementing the number of votes the
*                           comment has.
*/
const decrementNumberCommentVotes = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    // Set the number of votes the comment has to the value returned by the
    // database.
    comment.numberVotes = parseInt( response.Attributes.NumberVotes.N )
    return { comment }
  } catch( error ) {
    let errorMessage = `Could not decrement the number of votes the comment `
    + `has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error : errorMessage }
  }
}

/**
* Increments the votes a comment has.
* @param {String} tableName  The name of the DynamoDB table.
* @param {Object} comment    The comment to increment the vote.
* @returns {commentResponse} The result of incrementing the vote the comment
*                            has.
*/
const incrementCommentVote = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `Vote` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    // Set the number of votes the comment has to the value returned by the
    // database.
    comment.vote = parseInt( response.Attributes.Vote.N )
    return { comment }
  } catch( error ) {
    let errorMessage = `Could not increment the number of votes the comment `
    + `has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error : errorMessage }
  }
}

/**
* Decrements the vote a comment has.
* @param {String} tableName The name of the DynamoDB table.
* @param {Object} comment   The comment to decrement the vote.
* @returns {Map}            The result of decrementing the vote the comment
*                           has.
*/
const decrementCommentVote = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `Vote` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    // Set the number of votes the comment has to the value returned by the
    // database.
    comment.vote = parseInt( response.Attributes.Vote.N )
    return { comment }
  } catch( error ) {
    let errorMessage = `Could not decrement the number of votes the comment `
    + `has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error : errorMessage }
  }
}

module.exports = { 
  addComment, getComment, removeComment,
  incrementNumberCommentVotes, decrementNumberCommentVotes,
  incrementCommentVote, decrementCommentVote
}