const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { sessionFromItem } = require( `../entities` )
const { executeTransactWrite } = require( `./utils` )

/**
 * Adds a session to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor to increment the number of sessions
 * @param {Object} session   The session to add to the table
 */
const addSession = async ( tableName, visitor, session ) => {
  if ( typeof tableName == `undefined` )
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  if ( typeof session == `undefined` ) throw new Error( `Must give session` )
  const params = {
    TransactItems: [
      { Update: {
        TableName: tableName,
        Key: visitor.key(),
        ConditionExpression: `attribute_exists(PK)`,
        UpdateExpression: `SET #count = #count + :inc`,
        ExpressionAttributeNames: { '#count': `NumberSessions` },
        ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      } },
      { Put: {
        TableName: tableName,
        Item: session.toItem(),
        ConditionExpression: `attribute_not_exists(PK)`,
      } }
    ] }
  try {
    await executeTransactWrite( { client: dynamoDB, params } )
    return { session }
  } catch( error ) {
    let errorMessage = `Could not add session`
    if ( error.code === `TransactionCanceledException` ) {
      if ( error.cancellationReasons[0].Code === `ConditionalCheckFailed` ) {
        errorMessage = `Visitor does not exist`
      }
      else if ( 
        error.cancellationReasons[1].Code === `ConditionalCheckFailed` 
      ) {
        errorMessage = `Session already in table`
      }
    }
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Retrieves a session from the table.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} session The session queried from the table.
 */
const getSession = async ( tableName, session ) => {
  if ( typeof tableName == `undefined` )
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof session == `undefined` ) throw new Error( `Must give session` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName, Key: session.key()
    } ).promise()
    if ( !result.Item ) return { error: `Session does not exist` }
    return { session: sessionFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not get session`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = { 
  addSession, getSession 
}