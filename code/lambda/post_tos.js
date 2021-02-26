const { User, updateUserName, addTOSToUser } = require( `/opt/nodejs/index` )

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
    typeof parsedBody.username == `undefined` ||
    typeof parsedBody.name == `undefined` ||
    typeof parsedBody.email == `undefined` ||
    typeof parsedBody.version == `undefined`
  ) return {
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin' : '*' }, 
    body: `Must give the user's number, name, email, and terms of service version in the body.`,
    isBase64Encoded: false
  }
  const { tos, error } = await addTOSToUser( 
    process.env.TABLE_NAME, 
    new User( {
      name: parsedBody.name,
      email: parsedBody.email,
      username: parsedBody.username
    } ),
    parsedBody.version
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
    body: JSON.stringify( tos ), 
    isBase64Encoded: false
  }
};
