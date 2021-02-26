const { User, updateUserName, getUserDetails } = require( `/opt/nodejs/index` )
const AWS = require( `aws-sdk` )
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
  { apiVersion: `2016-04-18` }
)
let parsedBody

/**
 * Sets the name attribute of a specific user.
 * @param {String} username The username of the requestor.
 * @param {String} newName  The new name to set.
 */
const setNameAttribute = async ( username, newName ) => {
  await cognitoIdentityServiceProvider
    .adminUpdateUserAttributes( {
      UserAttributes: [ { Name: `name`, Value: newName } ],
      UserPoolId: process.env.USERPOOLID,
      Username: username,
    } ).promise()
}

/**
 * Getting the basic blog details.
 *
 * This is called to get the basics of the blog's details. This returns the
 * number of users and posts.
 */
exports.handler = async ( event, context ) => {
  if (
    !event.body
  ) return {
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: `Must give the slug and the title in the body.`,
    isBase64Encoded: false
  } 
  try {
    parsedBody = JSON.parse( event.body )
  } catch( error ) {
    return {
      statusCode: 500, 
      headers: {
        'Access-Control-Allow-Origin' : '*'
      }, 
      body: `Body must be JSON formatted.`,
      isBase64Encoded: false
    }
  }

  if (
    typeof parsedBody.username == `undefined` ||
    typeof parsedBody.name == `undefined` ||
    typeof parsedBody.email == `undefined` ||
    typeof parsedBody.newName == `undefined`
  ) return {
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: `Must give the slug and the title in the body.`,
    isBase64Encoded: false
  }
  
  const { user, error } = await updateUserName( 
    process.env.TABLE_NAME, 
    new User( {
      name: parsedBody.name,
      email: parsedBody.email,
      username: parsedBody.username
    } ),
    parsedBody.newName
    ) 
    if ( error ) return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin' : '*' }, 
      body: JSON.stringify( error ), 
      isBase64Encoded: false
    }
  await setNameAttribute( parsedBody.username, parsedBody.newName )
  return { 
    statusCode: 200, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: JSON.stringify( user ), 
    isBase64Encoded: false
  }
};
