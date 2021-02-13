const {
  addBlog,
  addComment,
  addUser,
  addPost, getPostDetails, removePost,
  incrementNumberPostComments, decrementNumberPostComments
} = require( `..` )
const { Blog, Post, User } = require( `../../entities` )

describe( `addPost`, () => {
  test( `A post can be added to the table`, async () => {
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await addPost( `test-table`, post )
    expect( result ).toEqual( { post } )
  } )

  test( `Returns an error when the post is in the table`, async () => {
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    const result = await addPost( `test-table`, post )
    expect( result ).toEqual( {
      error: `Could not add '${ post.title }' to table`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await addPost( `table-not-exist`, post )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    await expect(
      addPost( `test-table` )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addPost()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getPostDetails`, () => {
  test( `A post and its details can be queried from the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const comment_result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    await addComment(
      `test-table`, user, post, `This is a reply.`, 
      [ comment_result.comment.dateAdded.toISOString() ]
    )
    post.numberComments += 1
    const result = await getPostDetails( `test-table`, post )
    expect( Object.keys( result ) ).toEqual( [ `post`, `comments` ] )
    const base_comments = Object.keys( result.comments )
    const reply_comments = Object.keys( 
      result.comments[base_comments[0]].replies 
    )
    expect( base_comments.length ).toEqual( 1 )
    expect( 
      Object.keys( result.comments[base_comments[0]].votes ).length 
    ).toEqual( 1 )
    expect( reply_comments.length ).toEqual( 1 )
    expect( 
      Object.keys( 
        result.comments[base_comments[0]].replies[reply_comments[0]].replies 
      ).length 
    ).toEqual( 0 )
    expect( 
      Object.keys( 
        result.comments[base_comments[0]].replies[reply_comments[0]].votes 
      ).length 
    ).toEqual( 1 )
  } )

  test( `Returns an error when the post is not in the table`, async () => {
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await getPostDetails( `test-table`, post )
    expect( result ).toEqual( {
      error: `Post does not exist`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await getPostDetails( `table-not-exist`, post )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    await expect(
      getPostDetails( `test-table` )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getPostDetails()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `removePost`, () => {
  test( `The post can be removed from the table`, async () => {
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
    result = await removePost( `test-table`, post )
    expect( result ).toEqual( post )
    result = await getPostDetails( `test-table`, post )
    expect( result ).toEqual( { 'error': `Post does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const result = await removePost( `table-not-exist`, post )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    await expect(
      removePost( `test-table` )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      removePost()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberPostComments`, () => {
  test( `The number of comments the post has can be incremented`, async () => { 
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    const result = await incrementNumberPostComments( `test-table`, post )
    post.numberComments += 1
    expect( result ).toEqual( { 'post': post } )
  } )

  test( `Returns an error when the post is not in the table`, async () => {
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await incrementNumberPostComments( `test-table`, post )
    expect( result ).toEqual( {
      error: `Post does not exist`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const result = await incrementNumberPostComments( `table-not-exist`, post )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    await expect(
      incrementNumberPostComments( `test-table` )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      incrementNumberPostComments()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberPostComments`, () => {
  test( `The number of comments the post has can be decremented`, async () => { 
    let blog = new Blog( {} )
    const post = new Post( { 
      slug: `/`, title: `Tyler Norlund`, numberComments: 1 
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    const result = await decrementNumberPostComments( `test-table`, post )
    post.numberComments -= 1
    expect( result ).toEqual( { post } )
  } )

  test( `Returns an error when the post is not in the table`, async () => {
    let blog = new Blog( {} )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await decrementNumberPostComments( `test-table`, post )
    expect( result ).toEqual( {
      error: `Post does not exist`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const result = await decrementNumberPostComments( `table-not-exist`, post )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    await expect(
      decrementNumberPostComments( `test-table` )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      decrementNumberPostComments()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )
