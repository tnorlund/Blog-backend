const { Comment, Vote, removeVote } = require( `/opt/nodejs/index` )

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
    typeof parsedBody.commentDateAdded == `undefined` ||
    typeof parsedBody.voteDateAdded == `undefined` || 
    typeof parsedBody.up == `undefined`
  ) return {
    statusCode: 500,
    headers: { 'Access-Control-Allow-Origin' : '*' },
    body: JSON.stringify( 
      `Must give the slug, name, username, and the comment details in the body.`
    ),
    isBase64Encoded: false
  }

  const { comment, error } = await removeVote(
    process.env.TABLE_NAME,
    new Comment( {
      username: parsedBody.username,
      userCommentNumber: `0`,
      name: parsedBody.name,
      slug: parsedBody.slug,
      text: ``,
      vote: 0,
      numberVotes: 0,
      dateAdded: parsedBody.commentDateAdded,
      replyChain: typeof parsedBody.replyChain == `undefined` ?
        [] : parsedBody.replyChain
    } ),
    new Vote( {
      username: parsedBody.username,
      name: parsedBody.name,
      slug: parsedBody.slug,
      voteNumber: `0`,
      up: parsedBody.up,
      replyChain: [ parsedBody.commentDateAdded ],
      dateAdded: parsedBody.voteDateAdded
      // replyChain: typeof parsedBody.replyChain == `undefined` ?
      //   [ parsedBody.voteDateAdded ] :
      //   parsedBody.replyChain.concat( [ parsedBody.voteDateAdded ] )
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
