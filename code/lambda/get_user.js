const { User, getUser } = require( `/opt/nodejs/index` )

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
      typeof event.queryStringParameters.username == `undefined`
    )
  ) return {
    statusCode: 500, 
    headers: {
      'Access-Control-Allow-Origin' : '*'
    }, 
    body: `Must give the name, email, and username in the query string.`,
    isBase64Encoded: false
  }
  const { user, error } = await getUser( 
    process.env.TABLE_NAME, new User( {
      name: event.queryStringParameters.name,
      email: event.queryStringParameters.email,
      username: event.queryStringParameters.username,
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
