const { Post, getPostDetails } = require( `/opt/nodejs/index` )

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
      typeof event.queryStringParameters.slug == `undefined` ||
      typeof event.queryStringParameters.title == `undefined`
    )
  ) return {
    statusCode: 500, 
    headers: {
      'Access-Control-Allow-Origin' : '*'
    }, 
    body: `Must give the post's slug and title in the query string.`,
    isBase64Encoded: false
  }
  const { post, comments, error } = await getPostDetails( 
    process.env.TABLE_NAME, new Post( {
      title: event.queryStringParameters.title,
      slug: event.queryStringParameters.slug
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
    body: JSON.stringify( { post, comments } ), 
    isBase64Encoded: false
  }
};
