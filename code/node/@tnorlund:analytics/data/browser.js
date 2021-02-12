const AWS = require( `aws-sdk` )
const { browserFromItem } = require( `../entities` )
const dynamoDB = new AWS.DynamoDB()

/**
 * Adds a browser to the DynamoDB table.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Object} browser   The browser object added.
 * @returns {Object}           Whether the browser was added to the table or 
 *                             the error that occurred.
 */
const addBrowser = async ( tableName, browser ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof browser == `undefined` ) throw new Error( `Must give browser` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: browser.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { browser }
  } catch( error ) {
    let errorMessage = `Could not add browser`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Browser already exists`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Retrieves the browser from DynamoDB.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Object} browser   The browser object requested
 * @returns {Object}           Whether the browser was retrieved from the table
 *                             or the error that occurred.
 */
const getBrowser = async ( tableName, browser ) => {
  if ( typeof tableName === `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof browser == `undefined` ) throw new Error( `Must give browser` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName, Key: browser.key()
    } ).promise()
    if ( !result.Item ) return { error: `Browser does not exist` }
    return { browser: browserFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not retrieve browser`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

module.exports = { addBrowser, getBrowser }