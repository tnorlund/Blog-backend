'use-strict'

/**
 * The Lambda Function's invocation context.
 * @typedef {CallerContext}
 * @param {string} clientId The Cognito User Pool Client ID.
 */

/**
 * The request made from the client.
 * @typedef {Request}
 * @param {string} codeParameter The 4 digits the user uses to verify their
 *   email address or phone number.
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
 * @property {Object} response The response sent from this Lambda Function to
 *   Cognito.
 * @property {string} userName The user name of the user signing up.
 */

/**
 * Sets the custom message during the Cognito User Pool sign up event.
 * @param {Event} event The event triggered by Cognito.
 * @param {Object} context The context of the Lambda Function's event.
 * @param {Function} callback The callback for the Lambda Function.
 */
exports.handler = async ( event, context, callback ) => {
  /**
   * Set the Cognito event when the user signs up.
   */
  if ( event.triggerSource === `CustomMessage_SignUp` ) {
    /** 
     * The 4 digits the client uses to verify the user's email address or phone
     * number 
     */
    const { codeParameter } = event.request

    /**
     * The payload used by the client to confirm the user's email or phone number.
     */
    const payload = Buffer.from( 
      JSON.stringify( { userName: event.userName } ) 
    ).toString( `base64` )
    
    /**
     * The url used to verify the email address.
     * 
     * This url is used to confirm the email address of the user signing up.
     * The url is changed to localhost when under development.
     */
    let url
    if( process.env.ENV && process.env.ENV == 'dev' ) url = `localhost:8000/?data=${ 
      payload }&code=${ codeParameter }`
    else url = `https://www.tylernorlund.com/?data=${
      payload }&code=${ codeParameter }`

    /**
     * Set the event's response.
     */
    event.response.smsMessage = `Use the link to verify your phone number. \n ${ url }`
    event.response.emailSubject = process.env.EMAILSUBJECT
    event.response.emailMessage = `Use the link to verify your email address. \n ${ url }`
    callback( null, event )
  } else {
    callback( null, event )
  }
}
