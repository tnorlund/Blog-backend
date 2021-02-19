const { Project, getProject } = require( `/opt/nodejs/index` )

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
    body: `Must give the slug and the title in the query string.`,
    isBase64Encoded: false
  }
  const { project, error } = await getProject( 
    process.env.TABLE_NAME, new Project( {
      slug: event.queryStringParameters.slug,
      title: event.queryStringParameters.title
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
    body: JSON.stringify( project ), 
    isBase64Encoded: false
  }
};
