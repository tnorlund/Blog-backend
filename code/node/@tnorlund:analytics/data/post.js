const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { aggregateData, aggregateDataToTransact } = require( `./utils` )
const { 
  Blog, Post, postFromItem, commentFromItem, voteFromItem 
} = require( `../entities` )

/**
 * Adds a post to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to add.
 * @returns {Map}            Whether the post was added to the table.
 */
const addPost = async ( tableName, post ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` ) throw new Error( `Must give post` )
  const blog = new Blog( {} )
  try {
    await dynamoDB.transactWriteItems( {
      TransactItems: [
        {
          Update: {
            TableName: tableName,
            Key: blog.key(),
            ConditionExpression: `attribute_exists(PK)`,
            UpdateExpression: `SET #count = #count + :inc`,
            ExpressionAttributeNames: { '#count': `NumberPosts` },
            ExpressionAttributeValues: { ':inc': { 'N': `1` } },
            ReturnValuesOnConditionCheckFailure: `ALL_OLD`
          },
        },
        {
          Put: {
            TableName: tableName,
            Item: post.toItem(),
            ConditionExpression: `attribute_not_exists(PK)`
          }
        }
      ]
    } ).promise()
    return { post }
  } catch( error ) {
    let errorMessage = `Could not add post to blog`
    if ( error.code === `TransactionCanceledException` )
      errorMessage = `Could not add '${post.title}' to table`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Retrieves the project and its followers from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user requested.
 * @returns {Map}            The result of accessing the database.
 */
const getPostDetails = async ( tableName, post ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` ) 
    throw new Error( `Must give post` )  
  try {
    const result = await dynamoDB.query( {
      TableName: tableName,
      IndexName: `GSI1`,
      KeyConditionExpression: `#gsi1pk = :gsi1pk`,
      ExpressionAttributeNames: { '#gsi1pk': `GSI1PK` },
      ExpressionAttributeValues: { ':gsi1pk': post.gsi1pk() },
      ScanIndexForward: true
    } ).promise()
    if ( result.Items.length == 0 ) return { error: `Post does not exist` }
    // Iterate over the results and parse then into their matching objects.
    let comments = {}
    let requestedPost
    result.Items.map( ( item ) => {
      switch ( item.Type.S ) {
        case `post`:
          requestedPost = postFromItem( item ); break
        case `comment`: {
          const requestedComment = commentFromItem( item )
          comments = _addCommentToComments(
            requestedComment, comments, [...requestedComment.replyChain]
          )
          break
        }
        case `vote`: {
          const requestedVote = voteFromItem( item )
          comments = _addVoteToComments(
            requestedVote, comments, [...requestedVote.replyChain]
          )
          break
        }
        default: throw new Error( `Could not parse type ${ item.Type.S }` )
      }
    } )
    return { post: requestedPost, comments }
  } catch( error ) {
    let errorMessage = `Could not get post details`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Recursively adds votes to comments.
 * @param {Object}   vote
 * @param {{Object}} comments
 * @param {[Date]}   replyChain
 */
const _addVoteToComments = ( vote, comments, replyChain ) => {
  const date = replyChain.shift().toISOString()
  // Set the value when the comment date is found and there are no other
  // replies in the chain.
  if (
    Object.keys( comments ).indexOf( date ) >= 0 &&
    replyChain.length == 0
  ) {
    comments[ date ].votes[vote.dateAdded.toISOString()] = vote
    return comments
  // Otherwise, recurse the function
  } else {
    comments[ date ].replies = _addVoteToComments(
      vote, comments[ date ].replies, replyChain
    )
    return comments
  }
}

/**
 * Recursively adds replies to comments
 * @param {Object}   comment
 * @param {[Object]} comments
 * @param {[Date]}   replyChain
 */
const _addCommentToComments = ( comment, comments, replyChain ) => {
  if ( replyChain.length > 0 ) {
    const date = replyChain.shift().toISOString()
    comments[ date ].replies = _addCommentToComments(
      comment, comments[ date ].replies, replyChain
    )
    return comments
  } else {
    comments[ comment.dateAdded.toISOString() ] = comment
    return comments
  }
}

/**
 * Removes the post and its details from the table.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post remove from the table.
 */
const removePost = async ( tableName, post ) => {
  if ( typeof tableName == `undefined` )
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` ) throw new Error( `Must give post` )
  const post_details = await getPostDetails( tableName, post )
  if ( post_details.error ) return post_details
  let aggregate_data = {}
  aggregate_data[`vote`] = []
  aggregate_data[`comment`] = []
  aggregate_data[`user`] = {}
  Object.values( post_details.comments ).forEach( ( comment ) => {
    aggregate_data = aggregateData( comment, aggregate_data )
  } )
  const transact_items = aggregateDataToTransact( aggregate_data, tableName )
  transact_items.push( {
    Delete: {
      TableName: tableName,
      Key: post.key(),
      ConditionExpression: `attribute_exists(PK)`
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
    return post
  } catch( error ) { 
    console.log( `error`, error )
    return { 'error': `Could not remove post` } 
  }
}

/**
 * Increments the number of comments in the DynamoDB post item.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to increment the number of comments.
 */
const incrementNumberPostComments = async ( tableName, post ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` )
    throw new Error( `Must give post` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: post.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'post': new Post( {
      slug: post.slug,
      title: post.title,
      numberComments: response.Attributes.NumberComments.N
    } ) }
  } catch( error ) {
    let errorMessage = `Could not increment number of post comments`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Post does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements the number of comments in the DynamoDB post item.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to decrement the number of comments.
 */
const decrementNumberPostComments = async ( tableName, post ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` )
    throw new Error( `Must give post` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: post.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'post': new Post( {
      slug: post.slug,
      title: post.title,
      numberComments: response.Attributes.NumberComments.N
    } ) }
  } catch( error ) {
    let errorMessage = `Could not decrement number of post comments`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Post does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = { 
  addPost, getPostDetails, removePost,
  incrementNumberPostComments, decrementNumberPostComments
}