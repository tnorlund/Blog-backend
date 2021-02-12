const {
  addBlog, addUser, addProjectFollow, updateProject, removeProject,
  addProject, getProject, getProjectDetails,
  incrementNumberProjectFollows, decrementNumberProjectFollows,
} = require( `..` )
const { Blog, User, Project, ProjectFollow } = require( `../../entities` )

describe( `addProject`, () => {
  test( `A project can be added to the table`, async () => {
    let blog = new Blog( {} )
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await addProject( `test-table`, project )
    expect( result ).toEqual( { project } )
  } )

  test( `Returns an error when the project is in the table`, async () => {
    let blog = new Blog( {} )
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    const result = await addProject( `test-table`, project )
    expect( result ).toEqual( {
      error: `Could not add '${ project.title}' to table`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let blog = new Blog( {} )
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    const result = await addProject( `table-not-exist`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      addProject( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addProject()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getProject`, () => {
  test( `A project can be queried from to the table`, async () => {
    let blog = new Blog( {} )
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    const result = await getProject( `test-table`, project )
    expect( result ).toEqual( { project } )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await getProject( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await getProject( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      getProject( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getProject()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getProjectDetails`, () => {
  test( `A project's details can be queried from to the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    let project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const projectFollow = new ProjectFollow( {
      userName: `Tyler`, userNumber: 1, userFollowNumber: 1, email: `me@me.com`,
      slug: `/`, title: `Tyler Norlund`, projectFollowNumber: 1
    } )
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const project_response = await addProject( `test-table`, project )
    await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )
    project.numberFollows += 1
    let result = await getProjectDetails( `test-table`, project )
    expect( { ...result.project } ).toEqual( project )
    expect( { 
      ...result.followers[0], dateFollowed: undefined 
    } ).toEqual( { ...projectFollow, dateFollowed: undefined } )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await getProjectDetails( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await getProjectDetails( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      getProjectDetails( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getProjectDetails()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `updateProject`, () => {
  test( `A project can be updated from to the table`, async () => {
    let blog = new Blog( {} )
    let project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    project = new Project( { slug: `/`, title: `A Ne Title` } )
    const result = await updateProject( `test-table`, project )
    expect( result ).toEqual( { project } )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await updateProject( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await updateProject( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      updateProject( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      updateProject()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `removeProject`, () => {
  test( `A project and followers can be removed from the table`, async () => {
    let blog = new Blog( {} )
    let project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const user_a = new User( { name: `Tyler`, email: `me@me.com` } )
    const user_b = new User( { name: `Joe`, email: `joe@me.com` } )
    const projectFollow_a = new ProjectFollow( {
      userName: `Tyler`, userNumber: 1, userFollowNumber: 1, email: `me@me.com`,
      slug: `/`, title: `Tyler Norlund`, projectFollowNumber: 1
    } )
    const projectFollow_b = new ProjectFollow( {
      userName: `Joe`, userNumber: 2, userFollowNumber: 2, email: `joe@me.com`,
      slug: `/`, title: `Tyler Norlund`, projectFollowNumber: 1
    } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    await addUser( `test-table`, user_a )
    await addUser( `test-table`, user_b )
    await addProjectFollow( `test-table`, user_a, project )
    await addProjectFollow( `test-table`, user_b, project )
    project.numberFollows = 2
    const result = await removeProject( `test-table`, project )
    expect( result.project ).toEqual( project )
    expect( { ...result.followers[0], dateFollowed: undefined } ).toEqual(
      { ...projectFollow_a, dateFollowed: undefined }
    )
    expect( { ...result.followers[1], dateFollowed: undefined } ).toEqual(
      { ...projectFollow_b, dateFollowed: undefined }
    )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await removeProject( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await removeProject( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      removeProject( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      removeProject()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberProjectFollows`, () => {
  test( `The number of follows the project has can be incremented`, async () => { 
    let project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, new Blog( {} ) )
    let result = await addProject( `test-table`, project )
    result = await incrementNumberProjectFollows( `test-table`, result.project )
    project.numberFollows += 1
    expect( result.project ).toEqual( project )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await incrementNumberProjectFollows( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await incrementNumberProjectFollows( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      incrementNumberProjectFollows( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberProjectFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberProjectFollows`, () => {
  test( `The number of follows the project has can be decremented`, async () => { 
    let project = new Project( {
      slug: `/`, title: `Tyler Norlund`, numberFollows: 1
    } )
    await addBlog( `test-table`, new Blog( {} ) )
    let result = await addProject( `test-table`, project )
    result = await decrementNumberProjectFollows( 
      `test-table`, result.project 
    )
    project.numberFollows -= 1
    expect( result.project ).toEqual( project )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await decrementNumberProjectFollows( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( { slug: `/`, title: `Tyler Norlund` } )
    const result = await decrementNumberProjectFollows( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      decrementNumberProjectFollows( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberProjectFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )
