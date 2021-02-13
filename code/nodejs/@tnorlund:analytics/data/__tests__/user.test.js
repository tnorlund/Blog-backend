const {
  addBlog, addTOS, addPost, addComment, addProject, addProjectFollow,
  addUser, getUser, getUserDetails, updateUserName,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes
} = require( `..` )
const { 
  Blog, User, Post, Project, TOS 
} = require( `../../entities` )

describe( `addUser`, () => {
  test( `A user can be added from to the table`, async () => {
    let blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    await addBlog( `test-table`, blog )
    const result = await addUser( `test-table`, user )
    blog.numberUsers += 1
    user.userNumber = blog.numberUsers
    expect( result ).toEqual( { blog, user } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    await addBlog( `test-table`, blog )
    const result = await addUser( `table-not-exist`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      addUser( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addUser()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getUser`, () => {
  test( `A user can be queried from to the table`, async () => {
    let blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    await addBlog( `test-table`, blog )
    await addUser( `test-table`, user )
    const result = await getUser( `test-table`, user )
    blog.numberUsers += 1
    user.userNumber = blog.numberUsers
    expect( result ).toEqual( { user } )
  } )  

  test( `Returns error when the user does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await getUser( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await getUser( `table-not-exist`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      getUser( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getUser()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getUserDetails`, () => {
  test( `A user's details can be queried from to the table`, async () => {
    let blog = new Blog( {} )
    let user = new User( { name: `Tyler`, email: `me@me.com` } )
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    let comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    let tos = new TOS( { 
      userNumber: 1, version: new Date().toISOString() 
    } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    let result = await addUser( `test-table`, user )
    user = result.user
    result = await addProjectFollow( `test-table`, user, project )
    user.numberFollows += 1
    const project_follow = result.projectFollow
    result = await addTOS( `test-table`, user, tos )
    tos = {}
    tos[result.tos.version.toISOString()] = result.tos
    await addPost( `test-table`, post )
    result = await addComment( 
      `test-table`, user, post, `This is a new comment` 
    )
    comment = result.comment
    let vote = result.vote
    user.numberComments += 1
    user.numberVotes += 1
    result = await getUserDetails( `test-table`, user )
    expect( result ).toEqual( { 
      user, 
      follows: [ project_follow ],
      comments: [ comment ],
      votes: [ vote ],
      tos
    } )
  } ) 

  test( `Returns error when the user does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await getUserDetails( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await getUserDetails( `table-not-exist`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      getUserDetails( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getUserDetails()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `updateUserName`, () => {
  test( `The user's name can be updated in the table`, async () => {
    let blog = new Blog( {} )
    let user = new User( {
      name: `Tyler`, email: `me@me.com`, numberFollows: 0
    } )
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const tos = new TOS( { 
      userNumber: 1, version: new Date().toISOString() 
    } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    await addUser( `test-table`, user )
    await addTOS( `test-table`, user, tos )
    await addProjectFollow( `test-table`, user, project )
    user.numberFollows += 1
    await addPost( `test-table`, post )
    await addComment( `test-table`, user, post, `This is a new comment` )
    user.numberComments += 1
    user.numberVotes += 1
    let result = await updateUserName( `test-table`, user, `Simon` )
    user.name = `Simon`
    expect( result ).toEqual( user )
    result = await getUserDetails( `test-table`, user )
    expect( result.user ).toEqual( user )
    expect( 
      result.votes.every( ( vote ) => vote.userName == `Simon` ) 
    ).toBe( true )
    expect( 
      result.comments.every( ( comment ) => comment.userName == `Simon` ) 
    ).toBe( true )
    expect( 
      result.follows.every( 
        ( projectFollow ) => projectFollow.userName == `Simon` 
      ) 
    ).toBe( true )
  } )

  test( `Returns error when the user does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await updateUserName( `test-table`, user, `Simon` )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await updateUserName( `table-not-exist`, user, `Simon` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no username  is given`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`, numberFollows: 0
    } )
    await expect(
      updateUserName( `test-table`, user )
    ).rejects.toThrow( `Must give username` )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      updateUserName( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      updateUserName()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberUserFollows`, () => {
  test( `The number of follows the user has can be incremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberFollows: 0
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await incrementNumberUserFollows( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberFollows: 1 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberUserFollows( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberUserFollows( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      incrementNumberUserFollows( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberUserFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberUserFollows`, () => {
  test( `The number of follows the user has can be decremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberFollows: 2
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await decrementNumberUserFollows( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberFollows: 1 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await decrementNumberUserFollows( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await decrementNumberUserFollows( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      decrementNumberUserFollows( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberUserFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberUserComments`, () => {
  test( `The number of comments the user has can be incremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberComments: 0
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await incrementNumberUserComments( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberComments: 1 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberUserComments( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberUserComments( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      incrementNumberUserComments( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberUserComments()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberUserComments`, () => {
  test( `The number of comments the user has can be decremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberComments: 1
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await decrementNumberUserComments( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberComments: 0 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await decrementNumberUserComments( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await decrementNumberUserComments( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      decrementNumberUserComments( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberUserComments()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberUserVotes`, () => {
  test( `The number of votes the user has can be incremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberVotes: 0
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await incrementNumberUserVotes( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberVotes: 1 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberUserVotes( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberUserVotes( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      incrementNumberUserVotes( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberUserVotes()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberUserVotes`, () => {
  test( `The number of comments the user has can be decremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberVotes: 1
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await decrementNumberUserVotes( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberVotes: 0 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await decrementNumberUserVotes( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const result = await decrementNumberUserVotes( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      decrementNumberUserVotes( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberUserVotes()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )