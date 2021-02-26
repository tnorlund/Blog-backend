const { User, updateUserName, getUserDetails } = require( `/opt/nodejs/index` )
const AWS = require( `aws-sdk` )
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
  { apiVersion: `2016-04-18` }
)
let parsedBody

/**
 * Signs a user out of all sessions.
 * @param {String} userName The user name of the user to sign out.
 */
const signUserOut = async ( userName ) => {
  try {
    await cognitoIdentityServiceProvider.adminUserGlobalSignOut( {
      UserPoolId: process.env.USERPOOLID,
      Username: userName,
    } ).promise()
    return { userName: userName }
  } catch ( error ) { return { error: error } }
}

/**
 * Disables a user from signing in.
 * @param {String} userName The user name of the user to disable.
 */
const disableUser = async ( userName ) => {
  try {
    await cognitoIdentityServiceProvider.adminDisableUser( {
      UserPoolId: process.env.USERPOOLID,
      Username: userName,
    } ).promise()
    return { userName: userName }
  } catch ( error ) {
    return { error: error }
  }
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
    typeof parsedBody.username == `undefined`
  ) return {
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: `Must give the slug and the title in the body.`,
    isBase64Encoded: false
  }
  
  const { error: disable_error } = await disableUser( parsedBody.username )
  if ( disable_error ) return { 
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: JSON.stringify( disable_error ), 
    isBase64Encoded: false
  }

  const { error: sign_out_error } = await signUserOut( parsedBody.username )
  if ( sign_out_error ) return { 
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: JSON.stringify( sign_out_error ), 
    isBase64Encoded: false
  }

  return { 
    statusCode: 200, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: `Disabled user`, 
    isBase64Encoded: false
  }
};
