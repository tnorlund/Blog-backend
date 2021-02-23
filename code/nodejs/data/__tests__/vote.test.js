const {
  addBlog, addPost, addUser,
  addComment,
  addVote, removeVote
} = require( `..` )
const { Blog, User, Post, Comment, Vote } = require( `../../entities` )

const name = `Tyler`
const email = `someone@me.com`
const username = `4ec5a264-733d-4ee5-b59c-7911539e3942`
const slug = `/`
const title = `Tyler Norlund`
const userCommentNumber = 1
const text = `This is a new comment.`

const blog = new Blog( {} )
const user = new User( { name, email, username } )
const post = new Post( { slug, title } )

describe( `addVote`, () => {
  test( `An up-vote can be added to the table`, async () => {
    const secondary_user_name = `Joe`
    const secondary_user_email = `joe@me.com`
    const secondary_user_username = `11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000`
    const secondary_user = new User( {
      name: secondary_user_name, 
      email: secondary_user_email, 
      username: secondary_user_username
    } ) 
    const comment = new Comment( {
      username, userCommentNumber, name, slug, text, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      username: secondary_user_username, name: secondary_user_name,
      slug, voteNumber: 2, up: true, replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    await addUser( `test-table`, secondary_user )
    let result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    result = await addVote( 
      `test-table`, secondary_user, post, result.comment, true 
    )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `A down-vote can be added to the table`, async () => {
    const secondary_user_name = `Joe`
    const secondary_user_email = `joe@me.com`
    const secondary_user_username = `11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000`
    const secondary_user = new User( {
      name: secondary_user_name, 
      email: secondary_user_email, 
      username: secondary_user_username
    } ) 
    const comment = new Comment( {
      username, userCommentNumber, name, slug, text, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      username: secondary_user_username, name: secondary_user_name,
      slug, voteNumber: 2, up: false, replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    await addUser( `test-table`, secondary_user )
    let result = await addComment( 
      `test-table`, user, post, text
    )
    result = await addVote( 
      `test-table`, secondary_user, post, result.comment, false 
    )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const comment = new Comment( {
      username, userCommentNumber, name, slug, text, vote: 1, numberVotes: 1
    } )
    const result = await addVote( 
      `table-not-exist`, user, post, comment, false 
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no up or down is given`, async () => {
    const comment = new Comment( {
      username, userCommentNumber, name, slug, text, vote: 1, numberVotes: 1
    } )
    await expect(
      addVote( `test-table`, user, post, comment )
    ).rejects.toThrow( `Must give whether vote is up or down` )
  } )

  test( `Throws an error when no comment object is given`, async () => {
    await expect(
      addVote( `test-table`, user, post )
    ).rejects.toThrow( `Must give comment` )
  } )

  test( `Throws an error when no post object is given`, async () => {
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
    const secondary_user_name = `Joe`
    const secondary_user_email = `joe@me.com`
    const secondary_user_username = `11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000`
    const secondary_user = new User( {
      name: secondary_user_name, 
      email: secondary_user_email, 
      username: secondary_user_username
    } ) 
    let comment = new Comment( {
      username, userCommentNumber, name, slug, text, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      username: secondary_user_username, name: secondary_user_name,
      slug, voteNumber: 2, up: true, replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    await addUser( `test-table`, secondary_user )
    let result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    comment = result.comment
    result = await addVote( 
      `test-table`, secondary_user, post, result.comment, true 
    )
    result = await removeVote( `test-table`, comment, result.vote )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `A down-vote can be removed from the table`, async () => {
    const secondary_user_name = `Joe`
    const secondary_user_email = `joe@me.com`
    const secondary_user_username = `11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000`
    const secondary_user = new User( {
      name: secondary_user_name, 
      email: secondary_user_email, 
      username: secondary_user_username
    } ) 
    let comment = new Comment( {
      username, userCommentNumber, name, slug, text, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      username: secondary_user_username, name: secondary_user_name,
      slug, voteNumber: 2, up: false, replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    await addUser( `test-table`, secondary_user )
    let result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    comment = result.comment
    result = await addVote( 
      `test-table`, secondary_user, post, result.comment, false 
    )
    result = await removeVote( `test-table`, comment, result.vote )
    expect( { vote: { 
      ...result.vote, dateAdded: undefined, replyChain: undefined
    } } ).toEqual( { vote: { 
      ...vote, dateAdded: undefined, replyChain: undefined 
    } } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    let comment = new Comment( {
      username, userCommentNumber, name, slug, text, vote: 1, numberVotes: 1
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