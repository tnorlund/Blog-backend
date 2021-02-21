const { User, Comment, addVote } = require( `/opt/nodejs/index` )

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
    typeof parsedBody.name == `undefined` ||
    typeof parsedBody.email == `undefined` ||
    typeof parsedBody.userNumber == `undefined` ||
    typeof parsedBody.slug == `undefined` ||
    typeof parsedBody.commentUserNumber == `undefined` ||
    typeof parsedBody.up == `undefined` ||
    typeof parsedBody.replyChain == `undefined`
  ) return {
    statusCode: 500,
    headers: { 'Access-Control-Allow-Origin' : '*' },
    body: `Must give the slug and the title in the body.`,
    isBase64Encoded: false
  }

  const { vote, error } = await addVote(
    process.env.TABLE_NAME,
    new User( {
      name: parsedBody.name,
      email: parsedBody.email,
      userNumber: parsedBody.userNumber
    } ),
    new Comment( {
      userNumber: commentUserNumber,
      userCommentNumber: `0`,
      userName: parsedBody.name,
      slug: parsedBody.slug,
      text: ` `,
      vote: `0`,
      numberVotes: `0`,
      dateAdded: parsedBody.replyChain[
        parsedBody.replyChain.length - 1
      ]
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
    body: JSON.stringify( vote ),
    isBase64Encoded: false
  }
};
