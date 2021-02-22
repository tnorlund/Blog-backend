const { User, getUserDetails } = require( `/opt/nodejs/index` )

/**
 * 
 * @typedef Event
 * @param {string} resource The API gateway resource used.
 * @param {string} httpMethod The HTTP method used in the query. This is usually GET or POST.
 * @param {Params} queryStringParameters The query string parameters given.
 */

/**
 * Getting the basic blog details.
 *
 * This is called to get the basics of the blog's details. This returns the
 * number of users and posts.
 */
exports.handler = async ( event, context ) => {
  if (
    !event.queryStringParameters || (
      typeof event.queryStringParameters.name == `undefined` ||
      typeof event.queryStringParameters.email == `undefined` ||
      typeof event.queryStringParameters.number == `undefined`
    )
  ) return {
    statusCode: 500, 
    headers: {
      'Access-Control-Allow-Origin' : '*'
    }, 
    body: `Must give the name, email, and number in the query string.`,
    isBase64Encoded: false
  }
  const { user, error } = await getUserDetails( 
    process.env.TABLE_NAME, new User( {
      name: event.queryStringParameters.name,
      email: event.queryStringParameters.email,
      userNumber: event.queryStringParameters.number,
    } ) 
  ) 
  if ( error ) return{ 
    statusCode: 500, 
    headers: {
      'Access-Control-Allow-Origin' : '*'
    }, 
    body: JSON.stringify( error ), 
    isBase64Encoded: false
  }
  return { 
    statusCode: 200, 
    headers: {
      'Access-Control-Allow-Origin' : '*'
    }, 
    body: JSON.stringify( { user } ), 
    isBase64Encoded: false
  }
};
