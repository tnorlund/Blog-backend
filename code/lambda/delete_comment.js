const { Comment, removeComment } = require( `/opt/nodejs/index` )

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
    typeof parsedBody.name == `undefined` ||
    typeof parsedBody.username == `undefined` || 
    typeof parsedBody.dateAdded == `undefined`
  ) return {
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: `Must give the post's slug, the user's name and username in the body.`,
    isBase64Encoded: false
  }
  
  const { comment, error } = await removeComment( 
    process.env.TABLE_NAME, 
    new Comment( {
      username: parsedBody.username,
      userCommentNumber: `0`,
      name: parsedBody.name,
      slug: parsedBody.slug,
      text: ``,
      vote: 0,
      numberVotes: 0,
      dateAdded: parsedBody.dateAdded,
      replyChain: typeof parsedBody.replyChain == `undefined` ? [] : parsedBody.replyChain
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
    body: JSON.stringify( comment ), 
    isBase64Encoded: false
  }
};
