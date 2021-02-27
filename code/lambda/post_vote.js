const { User, Post, Comment, addVote } = require( `/opt/nodejs/index` )

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
    typeof parsedBody.name == `undefined` ||
    typeof parsedBody.email == `undefined` ||
    typeof parsedBody.username == `undefined` ||
    typeof parsedBody.commentUsername == `undefined` ||
    typeof parsedBody.slug == `undefined` ||
    typeof parsedBody.commentDateAdded == `undefined` ||
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
      username: parsedBody.username
    } ),
    new Post( {
      slug: parsedBody.slug,
      title: `something`
    } ),
    new Comment( {
      username: parsedBody.commentUsername,
      userCommentNumber: `0`,
      name: parsedBody.name,
      slug: parsedBody.slug,
      text: ` `,
      vote: `0`,
      numberVotes: `0`,
      dateAdded: parsedBody.commentDateAdded,
      replyChain: parsedBody.replyChain
    } ),
    parsedBody.up
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
