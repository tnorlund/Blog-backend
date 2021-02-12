const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { incrementNumberBlogUsers } = require( `./blog` )
const { 
  userFromItem, 
  tosFromItem, 
  projectFollowFromItem ,
  commentFromItem,
  voteFromItem
} = require( `../entities` )

/**
 * Adds a user to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {User} user        The user added to the blog.
 */
const addUser = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  const { blog, error } = await incrementNumberBlogUsers( tableName )
  if ( error ) return { error: error }
  // Set the user's number to the new number of users in the blog.
  user.userNumber = blog.numberUsers
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: user.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { user, blog }
  } catch( error ) {
    return { 'error': `Could not add user to blog` }
  }
}

/**
 * Retrieves the user from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user requested.
 */
const getUser = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName,
      Key: user.key()
    } ).promise()
    if ( !result.Item ) return { error: `User does not exist` }
    return { user: userFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not get user`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Retrieves the user and their details from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user requested.
 */
const getUserDetails = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  try {
    const result = await dynamoDB.query( {
      TableName: tableName,
      KeyConditionExpression: `#pk = :pk`,
      ExpressionAttributeNames: { '#pk': `PK` },
      ExpressionAttributeValues: { ':pk': user.pk() },
      ScanIndexForward: false
    } ).promise()
    if ( result.Items.length == 0 ) return { error: `User does not exist` }
    let requestedUser
    let comments = []
    let votes = []
    let tos = {}
    let follows = []
    result.Items.map( ( item ) => {
      switch ( item.Type.S ) {
        case `user`:
          requestedUser = userFromItem( item ); break
        case `terms of service`: {
          const requestedTOS = tosFromItem( item )

          tos[requestedTOS.version.toISOString()] = requestedTOS
          break
        }
        case `project follow`:
          follows.push( projectFollowFromItem( item ) ); break
        case `comment`:
          comments.push( commentFromItem( item ) ); break
        case `vote`:
          votes.push( voteFromItem( item ) ); break
        default: throw Error( `Could not parse type ${ item.Type.S }` )
      }
    } )
    return { user: requestedUser, votes, tos, comments, follows }
  } catch( error ) {
    let errorMessage = `Could not get user`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Updates the name of a user.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to change the name of.
 * @param {String} username  The new name of the user.
 */
const updateUserName = async ( tableName, user, username ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  if ( typeof username == `undefined` ) throw new Error( `Must give username` )
  const user_details = await getUserDetails( tableName, user )
  if ( user_details.error ) return user_details
  const transact_items = []
  // Update the user item
  transact_items.push( { Update: {
    TableName: tableName,
    Key: user.key(),
    ConditionExpression: `attribute_exists(PK)`,
    UpdateExpression: `SET #user = :user`,
    ExpressionAttributeNames: { '#user': `Name` },
    ExpressionAttributeValues: { ':user': { 'S': username } },
  } } )
  // Update the follows
  user_details.follows.forEach( ( follow ) => {
    transact_items.push( { Update: {
      TableName: tableName,
      Key: follow.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #user = :user`,
      ExpressionAttributeNames: { '#user': `UserName` },
      ExpressionAttributeValues: { ':user': { 'S': username } }
    } } )
  } )
  // Update the comments
  user_details.comments.forEach( ( comment ) => {
    transact_items.push( { Update: {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #user = :user`,
      ExpressionAttributeNames: { '#user': `User` },
      ExpressionAttributeValues: { ':user': { 'S': username } }
    } } )
  } )
  // Update the votes
  user_details.votes.forEach( ( vote ) => {
    transact_items.push( { Update: {
      TableName: tableName,
      Key: vote.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #user = :user`,
      ExpressionAttributeNames: { '#user': `UserName` },
      ExpressionAttributeValues: { ':user': { 'S': username } }
    } } )
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
    user.name = username
    return user
  } catch( error ) { 
    console.log( `error`, error )
    return { 'error': `Could not update username` } 
  }
}

/**
 * Increments a user's number of projects that they follow in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to increment the number of projects they
 *                           follow.
 */
const incrementNumberUserFollows = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberFollows` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment project follows`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements a user's number of projects that they follow in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to decrement the number of projects they
 *                           follow.
 */
const decrementNumberUserFollows = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberFollows` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not decrement project follows`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments a user's number of comments in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to increment the number of comments they
 *                           have.
 */
const incrementNumberUserComments = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment comments`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements a user's number of comments in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to decrement the number of comments they
 *                           have.
 */
const decrementNumberUserComments = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not decrement comments`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments a user's number of votes in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to increment the number of votes they
 *                           have.
 */
const incrementNumberUserVotes = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment votes`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements a user's number of votes in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to decrement the number of votes they
 *                           have.
 */
const decrementNumberUserVotes = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not decrement comments`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = {
  addUser, getUser, getUserDetails, updateUserName,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes
}