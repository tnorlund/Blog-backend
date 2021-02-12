const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()

/**
 * Adds a user to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to add the Terms of Service to.
 * @param {String} tos       The version of the Terms of Service.
 */
const addTOS = async ( tableName, user, tos ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  if ( typeof tos == `undefined` ) 
    throw new Error( `Must give terms of service` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: tos.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { tos }
  } catch( error ) {
    let errorMessage = `Could not add Terms of Service to user`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `'${ user.name }' already accepted this Terms of Service`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

module.exports = { addTOS }