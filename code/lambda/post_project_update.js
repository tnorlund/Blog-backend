const { Project, updateProject } = require( `/opt/nodejs/index` )

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
    const parsedBody = JSON.parse( event.body )
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
    typeof parsedBody.title == `undefined` ||
    typeof parsedBody.numberFollows == `undefined`
  ) return {
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: `Must give the slug and the title in the body.`,
    isBase64Encoded: false
  }
  
  const { project, error } = await addFollowToProject( 
    process.env.TABLE_NAME, 
   new Project( {
     slug: parsedBody.slug,
     title: parsedBody.title,
     numberFollows: parsedBody.numberFollows
   } )
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
    body: JSON.stringify( project ), 
    isBase64Encoded: false
  }
};
