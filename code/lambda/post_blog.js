const { Blog, addBlog } = require( `/opt/nodejs/index` )

let response 

/**
 * Adds a blog item.
 *
 * This is called to get the basics of the blog's details. This returns the
 * number of users and posts.
 */
exports.handler = async ( event, context ) => {
  const { blog, error } = await addBlog( 
    process.env.TABLE_NAME, new Blog( {} ) 
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
    body: JSON.stringify( blog ), 
    isBase64Encoded: false
  }
};
