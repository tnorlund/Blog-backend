const {
  addBlog, addPost, addUser,
  addComment,
  addVote, removeVote
} = require( `..` )
const { Blog, User, Post, Comment, Vote } = require( `../../entities` )

describe( `addVote`, () => {
  test( `An up-vote can be added to the table`, async () => {
    const blog = new Blog( {} )
    const user_a = new User( { name: `Tyler`, email: `me@me.com` } )
    const user_b = new User( { name: `John`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 2, userName: `John`, slug: `/`, voteNumber: 2, up: true,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user_a )
    await addUser( `test-table`, user_b )
    let result = await addComment( 
      `test-table`, user_a, post, `This is a new comment.`
    )
    result = await addVote( `test-table`, user_b, post, result.comment, true )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `A down-vote can be added to the table`, async () => {
    const blog = new Blog( {} )
    const user_a = new User( { name: `Tyler`, email: `me@me.com` } )
    const user_b = new User( { name: `John`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 2, userName: `John`, slug: `/`, voteNumber: 2, up: false,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user_a )
    await addUser( `test-table`, user_b )
    let result = await addComment( 
      `test-table`, user_a, post, `This is a new comment.`
    )
    result = await addVote( `test-table`, user_b, post, result.comment, false )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const result = await addVote( 
      `table-not-exist`, user, post, comment, false 
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no up or down is given`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    await expect(
      addVote( `test-table`, user, post, comment )
    ).rejects.toThrow( `Must give whether vote is up or down` )
  } )

  test( `Throws an error when no comment object is given`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await expect(
      addVote( `test-table`, user, post )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no post object is given`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    await expect(
      addVote( `test-table`, user )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      addVote( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addVote()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )


describe( `removeVote`, () => {
  test( `An up-vote can be removed from the table`, async () => {
    const blog = new Blog( {} )
    const user_a = new User( { name: `Tyler`, email: `me@me.com` } )
    const user_b = new User( { name: `John`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 2, userName: `John`, slug: `/`, voteNumber: 2, up: true,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user_a )
    await addUser( `test-table`, user_b )
    let result = await addComment( 
      `test-table`, user_a, post, `This is a new comment.`
    )
    comment = result.comment
    result = await addVote( `test-table`, user_b, post, result.comment, true )
    result = await removeVote( `test-table`, comment, result.vote )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `A down-vote can be removed from the table`, async () => {
    const blog = new Blog( {} )
    const user_a = new User( { name: `Tyler`, email: `me@me.com` } )
    const user_b = new User( { name: `John`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 2, userName: `John`, slug: `/`, voteNumber: 2, up: false,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user_a )
    await addUser( `test-table`, user_b )
    let result = await addComment( 
      `test-table`, user_a, post, `This is a new comment.`
    )
    comment = result.comment
    result = await addVote( `test-table`, user_b, post, result.comment, false )
    result = await removeVote( `test-table`, comment, result.vote )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    await expect(
      removeVote( `test-table`, comment )
    ).rejects.toThrow( `Must give vote` )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      removeVote( `test-table` )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      removeVote()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )