const { Blog, User, blogFromItem, addUser } = require( `/opt/nodejs/index` )
const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()

/**
 * The Lambda Function's invocation context.
 * @typedef {CallerContext}
 * @param {string} clientId The Cognito User Pool Client ID.
 */

/**
 * The request made from the client.
 * @typedef {Request}
 * @param {string} codeParameter The 4 digits the user uses to verify their
 *   email address.
 */

/**
 * The Cognito event.
 * @typedef {Object} Event 
 * @property {CallerContext} callerContext The Lambda Function's invocation
 *   context.
 * @property {string} triggerSource Where the Lambda Function is being
 *   triggered.
 * @property {string} region The AWS region the Cognito User Pool is in.
 * @property {Request} request The request sent from the client.
 * @property {Object} response The response sent to Cognito.
 * @property {string} userName The user name of the user signing up.
 */

/**
 * Sends a custom message to the user's email after signing up.
 * @param {Event} event The event triggered by Cognito.
 * @param {Object} context The context of the Lambda Function's event.
 * @param {Function} callback The callback for the Lambda Function.
 */
exports.handler = ( event, context, callback ) => {
  console.log( { event } )
  // Define the URL that you want the user to be directed to after verification
  // is complete
  if ( event.triggerSource === `CustomMessage_SignUp` ) {
    const { codeParameter } = event.request
    const { region, userName } = event
    const { clientId } = event.callerContext
    const redirectUrl = `${process.env.REDIRECTURL}/?username=${userName}`
    const resourcePrefix = process.env.RESOURCENAME.split( `CustomMessage` )[0]

    // Get the user attributes
    const { name, email } = event.request.userAttributes

    // Set the table name
    let tableName = `blogDB`
    if( process.env.ENV && process.env.ENV !== `NONE` )
      tableName = tableName + `-` + process.env.ENV

    // Add this user to the DynamoDB.
    const newUser = new User( { name: name, email: email } )

    // Look through the different regions to see which region the event was
    // called from.
    const hyphenRegions = [
      `us-east-1`, `us-west-1`, `us-west-2`,
      `ap-southeast-1`, `ap-southeast-2`, `ap-northeast-1`,
      `eu-west-1`, `sa-east-1`,
    ]
    const separator = hyphenRegions.includes( region ) ? `-` : `.`

    // Set the payload for the link to authenticate the user.
    const payload = Buffer.from(
      JSON.stringify( { userName, redirectUrl, region, clientId } )
    ).toString( `base64` )

    // Set the response
    /**
     * The url used to verify the email address should be the domain used in the blog.
     */
    const url = `https://www.tylernorlund.com/?data=${payload}&code=${codeParameter}`
    const message = `${process.env.EMAILMESSAGE}. \n ${url}`
    event.response.smsMessage = message
    event.response.emailSubject = process.env.EMAILSUBJECT
    event.response.emailMessage = message

    let blog = new Blog( {} )

    await addUser( {

    } )
    // dynamoDB.updateItem( {
    //   TableName: tableName,
    //   Key: blog.key(),
    //   ConditionExpression: `attribute_exists(PK)`,
    //   UpdateExpression: `SET #count = #count + :inc`,
    //   ExpressionAttributeNames: { '#count': `NumberUsers` },
    //   ExpressionAttributeValues: { ':inc': { 'N': `1` } },
    //   ReturnValues: `ALL_NEW`
    // } ).promise().then(
    //   ( response ) => {
    //     const requestedBlog = blogFromItem( response.Attributes )
    //     newUser.userNumber = requestedBlog.numberUsers
    //     dynamoDB.putItem( {
    //       TableName: tableName,
    //       Item: newUser.toItem(),
    //       ConditionExpression: `attribute_not_exists(PK)`
    //     } ).promise().then(
    //       () => callback( null, event )
    //     ).catch( callback )
    //   }
    // ).catch( callback )
    callback( null, event )
  } else {
    callback( null, event )
  }
}
