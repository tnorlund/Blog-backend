/* eslint-disable-line */ 
const aws = require( `aws-sdk` )

/**
 * The Lambda Function's invocation context.
 * @typedef {CallerContext}
 * @param {string} clientId The Cognito User Pool Client ID.
 */

 /**
 * The request made from the client.
 * @typedef {Request}
 * @param {[Object]} userAttributes The attributes the user created while they
 *   signed up.
 */

/**
 * The Cognito event.
 * @typedef {Object} Event 
 * @property {CallerContext} callerContext The Lambda Function's invocation
 *   context.
 * @property {string} triggerSource Where the Lambda Function is being
 *   triggered.
 * @property {Request} request The request sent from the client.
 * @property {string} region The AWS region the Cognito User Pool is in.
 * @property {Object} response The response sent from this Lambda Function to
 *   Cognito.
 * @property {string} userName The user name of the user signing up.
 * @property {string} userPoolId The Cognito User Pool ID.
 * @property {string} version The Cognito User Pool's version number.
 */

/**
 * Adds the user to a Cognito User Pool and DynamoDB after they confirm their
 *   identity.
 * @param {Event} event The event triggered by Cognito.
 * @param {Object} context The context of the Lambda Function's event.
 * @param {Function} callback The callback for the Lambda Function.
 */
exports.handler = async ( event, context, callback ) => {
  console.log( event.request.userAttributes )

  const cognitoidentityserviceprovider =
    new aws.CognitoIdentityServiceProvider( { 
      apiVersion: `2016-04-18` 
    } )
  const groupParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
  }

  const addUserParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  }

  try {
    console.log( {groupParam} )
    await cognitoidentityserviceprovider.getGroup( groupParams ).promise()
  } catch ( error ) {
    console.log( { error } )
    await cognitoidentityserviceprovider.createGroup( groupParams ).promise()
  }

  try {
    console.log( { addUserParams } )
    await cognitoidentityserviceprovider
      .adminAddUserToGroup( addUserParams ).promise()
    callback( null, event )
  } catch ( e ) {
    callback( e )
  }
}
