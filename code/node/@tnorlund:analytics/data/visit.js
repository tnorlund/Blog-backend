const AWS = require( `aws-sdk` )
const { visitFromItem } = require( `../entities` )
const { 
  executeTransactWrite 
} = require( `./utils` )
const dynamoDB = new AWS.DynamoDB()

/**
 * Adds a visit to the DynamoDB table.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Object} visit     The visit object added.
 * @returns {Object}           Whether the visit was added to the table or 
 *                             the error that occurred.
 */
const addVisit = async ( tableName, visit ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visit == `undefined` ) throw new Error( `Must give visit` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: visit.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { visit }
  } catch( error ) {
    let errorMessage = `Could not add visit`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Visit already exists`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Adds multiple visits to the DynamoDB table.
 * @param   {String}   tableName The name of the DynamoDB table.
 * @param   {[Object]} visits    The visit objects added to the table.
 * @returns {Object}             Whether the visits were added to the table or
 *                               the error that occurred.
 */
const addVisits = async ( tableName, visits ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visits == `undefined` ) throw new Error( `Must give visits` )
  const params = { TransactItems: visits.map(
    ( visit ) => {
      return { Put: {
        TableName: tableName, Item: visit.toItem(),
        ConditionExpression: `attribute_not_exists(PK)`
      } }
    }
  ) }
  try {
    await executeTransactWrite( { client: dynamoDB, params } )
    return { visits }
  } catch( error ) {
    let errorMessage = `Could not add session`
    if ( error.code === `TransactionCanceledException` ) {
      errorMessage = `Visit already exists`
    }
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }

}

/**
 * Retrieves the visit from DynamoDB.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Object} visit     The visit object requested
 * @returns {Object}           Whether the visit was retrieved from the
 *                             table or the error that occurred.
 */
const getVisit = async ( tableName, visit ) => {
  if ( typeof tableName === `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visit == `undefined` ) throw new Error( `Must give visit` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName, Key: visit.key()
    } ).promise()
    if ( !result.Item ) return { error: `Visit does not exist` }
    return { visit: visitFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not retrieve visit`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

module.exports = { addVisit, addVisits, getVisit }