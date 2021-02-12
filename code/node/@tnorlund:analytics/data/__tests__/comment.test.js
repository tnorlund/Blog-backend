const { 
  addBlog, addPost, addUser,
  addComment, getComment, removeComment, 
  incrementNumberCommentVotes, decrementNumberCommentVotes,
  incrementCommentVote, decrementCommentVote
} = require( `..` )

const { Blog, User, Post, Comment, Vote } = require( `../../entities` )
const { getPostDetails } = require( `../post` )
const { getUserDetails } = require( `../user` )

describe( `addComment`, () => {
  test( `A comment can be added to the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 1, userName: `Tyler`, slug: `/`, voteNumber: 1, up: true,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    expect( { 
      comment: { 
        ...result.comment, dateAdded: undefined 
      },
      vote: {
        ...result.vote, dateAdded: undefined, replyChain: undefined
      }
    } ).toEqual( { 
      comment: { ...comment, dateAdded: undefined }, 
      vote: { ...vote, dateAdded: undefined, replyChain: undefined }
    } )
  } )

  test( `A comment reply can be added to the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 2, userName: `Tyler`, slug: `/`, 
      text: `This is a reply.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 1, userName: `Tyler`, slug: `/`, voteNumber: 1, up: true,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const first_comment = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    const second_comment = await addComment( 
      `test-table`, user, post, `This is a reply.`, 
      [ first_comment.comment.dateAdded ]
    )
    expect( { 
      comment: { 
        ...second_comment.comment, dateAdded: undefined 
      },
      vote: {
        ...second_comment.vote, dateAdded: undefined, replyChain: undefined
      }
    } ).toEqual( { 
      comment: { 
        ...comment, 
        replyChain: [ first_comment.comment.dateAdded ], 
        dateAdded: undefined 
      }, 
      vote: { ...vote, dateAdded: undefined, replyChain: undefined }
    } )
  } )

  test( `Returns error when the user does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the post does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, new Blog( {} ) )
    await addUser( `test-table`, user )
    const result = await await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    expect( result ).toEqual( { 'error': `Post does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const result = await addComment( 
      `not-a-table`, user, post, `This is a new comment.`
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given.`, async () => {
    await expect( 
      addComment( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no post object is given.`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    await expect( 
      addComment( `test-table`, user )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no comment text is given.`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await expect( 
      addComment( `test-table`, user, post )
    ).rejects.toThrow( `Must give the text of the comment` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      addComment()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getComment`, () => {
  test( `A comment can be queried from to the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    let result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    result = await getComment( `test-table`, result.comment )
    expect( {
      comment: { ...result.comment, dateAdded: undefined }
    } ).toEqual( { comment: { ...comment, dateAdded: undefined } } )
  } )

  test( `Returns an error the comment is not in the table`, async () => {
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 2, userName: `Tyler`, slug: `/`, 
      text: `This is a reply.`, vote: 1, numberVotes: 1
    } )
    const result = await getComment( `test-table`, comment )
    expect( result ).toEqual( { error: `Comment does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 2, userName: `Tyler`, slug: `/`, 
      text: `This is a reply.`, vote: 1, numberVotes: 1
    } )
    const result = await getComment( `not-a-table`, comment )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no comment is given.`, async () => {
    await expect(
      getComment( `test-table` )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getComment()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `removeComment`, () => {
  test( `A comment and its details can be removed from the table`,
    async () => {
      const blog = new Blog( {} )
      const user = new User( { name: `Tyler`, email: `me@me.com` } )
      const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
      await addBlog( `test-table`, blog )
      await addPost( `test-table`, post )
      await addUser( `test-table`, user )
      let result = await addComment( 
        `test-table`, user, post, `This is a new comment.`
      )
      comment = result.comment 
      result = await addComment(
        `test-table`, user, post, `This is a reply`, [comment.dateAdded]
      )
      result = await removeComment( `test-table`, comment )
      expect( result ).toEqual( comment )
      const post_details = await getPostDetails( `test-table`, post )
      expect( post_details ).toEqual( { post, comments:{} } )
      const user_details = await getUserDetails( `test-table`, user )
      expect( user_details.user ).toEqual( user )
    } 
  )
  
  test( `A reply comment and its details can be removed from the table`,
    async () => {
      const blog = new Blog( {} )
      const user = new User( { name: `Tyler`, email: `me@me.com` } )
      const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
      await addBlog( `test-table`, blog )
      await addPost( `test-table`, post )
      await addUser( `test-table`, user )
      let result = await addComment( 
        `test-table`, user, post, `This is a new comment.`
      )
      const base_comment = result.comment 
      result = await addComment(
        `test-table`, user, post, `This is a reply`, [base_comment.dateAdded]
      )
      post.numberComments += 1
      user.numberComments += 1
      user.numberVotes += 1
      const comment = result.comment
      let post_details = await getPostDetails( `test-table`, post )
      let comments = post_details.comments
      comments[ base_comment.dateAdded.toISOString() ].replies = {}
      result = await removeComment( `test-table`, comment )
      expect( result ).toEqual( comment )
      post_details = await getPostDetails( `test-table`, post )
      expect( post_details ).toEqual( { post, comments } )
      const user_details = await getUserDetails( `test-table`, user )
      expect( user_details.user ).toEqual( user )
    } 
  )

  test( `Returns error when the table does not exist`, async () => {
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 2, userName: `Tyler`, slug: `/`, 
      text: `This is a reply.`, vote: 1, numberVotes: 1
    } )
    const result = await removeComment( `not-a-table`, comment )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no comment is given.`, async () => {
    await expect(
      removeComment( `test-table` )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      removeComment()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberCommentVotes`, () => {
  test( `The number of votes a comment has can be incremented`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const comment_result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    const result = await incrementNumberCommentVotes( 
      `test-table`, comment_result.comment 
    )
    comment.numberVotes += 1
    expect( { 
      comment: { ...result.comment, dateAdded: undefined } 
    } ).toEqual( { 
      comment: { ...comment, dateAdded: undefined }, 
    } )
  } )

  test( `Returns error when the comment does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await incrementNumberCommentVotes( `test-table`, comment )
    expect( result ).toEqual( { 'error': `Comment does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await incrementNumberCommentVotes( 
      `table-not-exist`, comment 
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no comment is given.`, async () => {
    await expect(
      incrementNumberCommentVotes( `test-table` )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      incrementNumberCommentVotes()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberCommentVotes`, () => {
  test( `The number of votes a comment has can be incremented`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const comment_result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    const result = await decrementNumberCommentVotes( 
      `test-table`, comment_result.comment 
    )
    comment.numberVotes -= 1
    expect( { 
      comment: { ...result.comment, dateAdded: undefined } 
    } ).toEqual( { 
      comment: { ...comment, dateAdded: undefined }, 
    } )
  } )

  test( `Returns error when the comment does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await decrementNumberCommentVotes( `test-table`, comment )
    expect( result ).toEqual( { 'error': `Comment does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await decrementNumberCommentVotes( 
      `table-not-exist`, comment 
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no comment is given.`, async () => {
    await expect(
      decrementNumberCommentVotes( `test-table` )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      decrementNumberCommentVotes()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementCommentVote`, () => {
  test( `The number of votes a comment has can be incremented`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const comment_result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    const result = await incrementCommentVote( 
      `test-table`, comment_result.comment 
    )
    comment.vote += 1
    expect( { 
      comment: { ...result.comment, dateAdded: undefined } 
    } ).toEqual( { 
      comment: { ...comment, dateAdded: undefined }, 
    } )
  } )

  test( `Returns error when the comment does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await incrementCommentVote( `test-table`, comment )
    expect( result ).toEqual( { 'error': `Comment does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await incrementCommentVote( 
      `table-not-exist`, comment 
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no comment is given.`, async () => {
    await expect(
      incrementCommentVote( `test-table` )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      incrementCommentVote()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementCommentVote`, () => {
  test( `The number of votes a comment has can be incremented`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const comment_result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    const result = await decrementCommentVote( 
      `test-table`, comment_result.comment 
    )
    comment.vote -= 1
    expect( { 
      comment: { ...result.comment, dateAdded: undefined } 
    } ).toEqual( { 
      comment: { ...comment, dateAdded: undefined }, 
    } )
  } )

  test( `Returns error when the comment does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await decrementCommentVote( `test-table`, comment )
    expect( result ).toEqual( { 'error': `Comment does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => { 
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await decrementCommentVote( 
      `table-not-exist`, comment 
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no comment is given.`, async () => {
    await expect(
      decrementCommentVote( `test-table` )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      decrementCommentVote()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )
