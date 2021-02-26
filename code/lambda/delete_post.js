const { Post, removePost } = require( `/opt/nodejs/index` )

let parsedBody

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
    typeof parsedBody.slug == `undefined` ||
    typeof parsedBody.title == `undefined`
  ) return {
    statusCode: 500,
    headers: { 'Access-Control-Allow-Origin' : '*' },
    body: JSON.stringify( 
      `Must give the slug, name, username, and the comment details in the body.`
    ),
    isBase64Encoded: false
  }

  const { post, error } = await removePost(
    process.env.TABLE_NAME,
    new Post( {
      title: parsedBody.title,
      slug: parsedBody.slug
    } ),
  )
  if ( error ) return {
    statusCode: 500,
    headers: { 'Access-Control-Allow-Origin' : '*' },
    body: JSON.stringify( error ),
    isBase64Encoded: false
  }
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin' : '*' },
    body: JSON.stringify( post ),
    isBase64Encoded: false
  }
};
