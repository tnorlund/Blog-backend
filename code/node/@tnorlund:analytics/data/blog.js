const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { Blog, blogFromItem } = require( `../entities` )

/**
 * Adds a Blog to a DynamoDB table
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Blog}   blog      The blog object added.
 * @returns {Map}              Whether the blog was added to the DB.
 */
const addBlog = async ( tableName, blog ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof blog == `undefined` )
    throw new Error( `Must give blog` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: blog.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return( { blog: blog } )
  } catch( error ) {
    let errorMessage = `Could not create Blog`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Blog already exists`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Retrieves the blog data from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table
 */
const getBlog = async ( tableName ) => {
  if ( typeof tableName === `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  const blog = new Blog( {} )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName,
      Key: blog.key()
    } ).promise()
    if ( !result.Item ) return { error: `Blog does not exist` }
    return { blog: blogFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not retrieve blog`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Updates the DynamoDB blog item's attributes.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Blog}   blog      The blog to be updated.
 * @returns {Map}              Whether the blog was updated on the DB.
 */
const updateBlog = async ( tableName, blog ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof blog == `undefined` )
    throw new Error( `Must give blog` )
  try {
    const result = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #users = :users, #posts = :posts, `
      + `#projects = :projects`,
      ExpressionAttributeNames: {
        '#users': `NumberUsers`,
        '#posts': `NumberPosts`,
        '#projects': `NumberProjects`
      },
      ExpressionAttributeValues: {
        ':users':  { 'N': String( blog.numberUsers ) },
        ':posts': { 'N': String( blog.numberPosts ) },
        ':projects': { 'N': String( blog.numberProjects ) }
      },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return {
      blog: blogFromItem( result.Attributes )
    }
  } catch( error ) {
    let errorMessage = `Could not update the blog`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Resets the DynamoDB blog item's attributes to 0.
 * @param   {String} tableName The name of the DynamoDB table.
 * @returns {Map}              Whether the blog was updated on the DB.
 */
const resetBlog = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  const blog = new Blog( {} )
  try {
    const result = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #users = :users, #posts = :posts, `
      + `#projects = :projects`,
      ExpressionAttributeNames: {
        '#users': `NumberUsers`,
        '#posts': `NumberPosts`,
        '#projects': `NumberProjects`
      },
      ExpressionAttributeValues: {
        ':users':  { 'N': String( blog.numberUsers ) },
        ':posts': { 'N': String( blog.numberPosts ) },
        ':projects': { 'N': String( blog.numberProjects ) }
      },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return {
      blog: blogFromItem( result.Attributes )
    }
  } catch( error ) {
    let errorMessage = `Could not reset the blog`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Increments the number of users in the DynamoDB blog item.
 * @param {String} tableName The name of the DynamoDB table.
 */
const incrementNumberBlogUsers = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  let blog = new Blog( {} )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberUsers` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'blog': blogFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number of blog users`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements the number of users in the DynamoDB blog item.
 * @param {String} tableName The name of the DynamoDB table.
 */
const decrementNumberBlogUsers = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  let blog = new Blog( {} )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberUsers` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'blog': blogFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not decrement number of blog users`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments the number of posts in the DynamoDB blog item.
 * @param {String} tableName The name of the DynamoDB table.
 */
const incrementNumberBlogPosts = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  let blog = new Blog( {} )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberPosts` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'blog': blogFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number of blog posts`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements the number of posts in the DynamoDB blog item.
 * @param {String} tableName The name of the DynamoDB table.
 */
const decrementNumberBlogPosts = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  let blog = new Blog( {} )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberPosts` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'blog': blogFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not decrement number of blog posts`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments the number of projects in the DynamoDB blog item.
 * @param {String} tableName The name of the DynamoDB table.
 */
const incrementNumberBlogProjects = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  let blog = new Blog( {} )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberProjects` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'blog': blogFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number of blog projects`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements the number of projects in the DynamoDB blog item.
 * @param {String} tableName The name of the DynamoDB table.
 */
const decrementNumberBlogProjects = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  let blog = new Blog( {} )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberProjects` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'blog': blogFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not decrement number of blog projects`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = {
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogUsers, decrementNumberBlogUsers,
  incrementNumberBlogPosts, decrementNumberBlogPosts,
  incrementNumberBlogProjects, decrementNumberBlogProjects
}