const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { 
  visitorFromItem, sessionFromItem, browserFromItem 
} = require( `../entities` )

/**
 * Adds a visitor to the DynamoDB table.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor added to the table
 */
const addVisitor = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` )
    throw new Error( `Must give visitor` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: visitor.toItem(),
      ConditionExpression : `attribute_not_exists(PK)`
    } ).promise()
    return { visitor }
  } catch( error ) {
    let errorMessage = `Could not add visitor`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Visitor already in table`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Retrieves the visitor from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor requested.
 */
const getVisitor = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName,
      Key: visitor.key()
    } ).promise()
    if ( !result.Item ) return { error: `Visitor does not exist` }
    return { visitor: visitorFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not get visitor`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Retrieves the visitor and their details from DynamoDB.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Object} visitor   The visitor requested.
 * @returns {Object}           Whether the visitor was retrieved from the table
 *                             or the error that occurred.
 */
const getVisitorDetails = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  try {
    const result = await dynamoDB.query( {
      TableName: tableName,
      KeyConditionExpression: `#pk = :pk`,
      ExpressionAttributeNames: { '#pk': `PK` },
      ExpressionAttributeValues: { ':pk': visitor.pk() },
      ScanIndexForward: true
    } ).promise()
    if ( result.Items.length == 0 ) return { error: `Visitor does not exist` }
    // Iterate over the results and parse them into their matching objects.
    let visitor_details = {
      browsers: [], sessions: []
    }
    result.Items.map( ( item ) => {
      switch ( item.Type.S ) {
        case `visitor`:
          visitor_details[`visitor`] = visitorFromItem( item )
          break
        case `session`:
          visitor_details.sessions.push( sessionFromItem( item ) )
          break
        case `browser`:
          visitor_details.browsers.push( browserFromItem( item ) )
          break
        default: throw Error( `Could not parse type ${ item.Type.S }` )
      }
    } )
    return visitor_details
  } catch( error ) {
    let errorMessage = `Could not get visitor details`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments a visitor's number of sessions in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor to increment the number of sessions.
 */
const incrementNumberSessions = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: visitor.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberSessions` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'visitor': visitorFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number sessions`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Visitor does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements a visitor's number of sessions in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor to decrement the number of sessions.
 */
const decrementNumberSessions = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: visitor.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberSessions` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'visitor': visitorFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number sessions`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Visitor does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = { 
  addVisitor, getVisitor, getVisitorDetails,
  incrementNumberSessions, decrementNumberSessions
}