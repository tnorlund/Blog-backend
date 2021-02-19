
const aws = require( `aws-sdk` )
const {
  Blog, User,
  addBlog, getBlog,
  incrementNumberBlogUsers, addUser
} = require( `/opt/nodejs/index` )

/**
 * The Lambda Function's invocation context.
 * @typedef {CallerContext}
 * @param {string} clientId The Cognito User Pool Client ID.
 */

 /**
 * The request made from the client.
 * @typedef {Request}
 * @param {Attributes} userAttributes The attributes the user created while they
 *   sign up.
 */

 /**
  * The attributes of the user created while they sign up.
  * @typedef {Object} Attributes
  * @param {string} sub The user's username assigned to them.
  * @param {string} cognito:email_alias The user's email address.
  * @param {string} cognito:user_status Whether the user has verified their email
  *   address. This can be either 'UNCONFIRMED' or 'CONFIRMED'
  * @param {string} email_verified Whether the user has verified their email
  *   address. This can be either 'true' or 'false'.
  * @param {string} name The user's name
  * @param {string} email The user's email address.
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

  /**
   * The Cognito Identity Pool Provider used to get the User Pool Group details
   *   and add the user to the User Pool Group.
   */
  const cognito_idp = new aws.CognitoIdentityServiceProvider( {
    apiVersion: `2016-04-18`
  } )

  /**
   * The group parameters used in the 'Get' and 'Create' User Pool Groups.
   */
  const groupParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
  }

  /**
   * The user parameters used in the adminAddUserToGroup method.
   */
  const addUserParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  }

  /** The details of the blog */
  const { blog: blogResponse, error: blogError} = await getBlog( process.env.TABLE_NAME )
  if ( blogError == 'Blog does not exist' ) await addBlog( process.env.TABLE_NAME, new Blog( {} ) )
  else if ( blogError ) {
    console.log( { blogError } )
    callback( blogError )
  }
  const { blog: incrementedBlog, error: incrementError } = await incrementNumberBlogUsers( process.env.TABLE_NAME )
  if ( incrementError ) {
    console.log( { incrementError } )
    callback( incrementError )
  }
  const { user, error: userError } = await addUser( 
    process.env.TABLE_NAME, 
    new User( {
      name: event.request.userAttributes.name,
      email: event.request.userAttributes.email,
      userNumber: incrementedBlog.numberUsers
    } ) 
  )
  if ( userError ) {
    console.log( { userError } )
    callback( userError )
  }


  /**
   * Attempt to get the group details in order to ensure that the group exists.
   *   If it doesn't create the Cognito User Pool Group.
   */
  try {
    await cognito_idp.getGroup( groupParams ).promise()
  } catch ( error ) {
    await cognito_idp.createGroup( groupParams ).promise()
  }

  /**
   * Attempt to add the user to the Cognito User Pool Group.
   */
  try {
    await cognito_idp.adminAddUserToGroup( addUserParams ).promise()
    callback( null, event )
  } catch ( e ) {
    callback( e )
  }
}
