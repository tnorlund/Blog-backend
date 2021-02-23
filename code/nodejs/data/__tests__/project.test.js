const {
  addBlog, addUser, addProjectFollow, updateProject, removeProject,
  addProject, getProject, getProjectDetails,
  incrementNumberProjectFollows, decrementNumberProjectFollows,
} = require( `..` )
const { Blog, User, Project, ProjectFollow } = require( `../../entities` )

const name = `Tyler`
const email = `someone@me.com`
const username = `4ec5a264-733d-4ee5-b59c-7911539e3942`
const slug = `/`
const title = `Tyler Norlund`

const blog = new Blog( {} )
const user = new User( { name, email, username } )
const project = new Project( { slug, title } )


describe( `addProject`, () => {
  test( `A project can be added to the table`, async () => {
    await addBlog( `test-table`, blog )
    const result = await addProject( `test-table`, project )
    expect( result ).toEqual( { project } )
  } )

  test( `Returns an error when the project is in the table`, async () => {
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    const result = await addProject( `test-table`, project )
    expect( result ).toEqual( {
      error: `Could not add '${ project.title}' to table`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
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
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    const result = await getProject( `test-table`, project )
    expect( result ).toEqual( { project } )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const result = await getProject( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
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
    const projectFollow = new ProjectFollow( {
      username, name, email, slug, title
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
    project.numberFollows -= 1
  } )

  test( `Returns error when no project is in the table`, async () => {
    const result = await getProjectDetails( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
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
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    let new_project = new Project( { 
      slug, title: `A New Title` 
    } )
    const result = await updateProject( `test-table`, new_project )
    expect( result ).toEqual( { project: new_project } )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const result = await updateProject( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
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
    const secondary_user_name = `Joe`
    const secondary_user_email = `joe@me.com`
    const secondary_user_username = `11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000`
    const secondary_user = new User( {
      name: secondary_user_name, 
      email: secondary_user_email, 
      username: secondary_user_username
    } )
    const projectFollow = new ProjectFollow( {
      username, name, email, slug, title
    } )
    const secondary_projectFollow = new ProjectFollow( {
      username: secondary_user_username,
      name: secondary_user_name,
      email: secondary_user_email,
      slug, 
      title
    } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    await addUser( `test-table`, user )
    await addUser( `test-table`, secondary_user )
    await addProjectFollow( `test-table`, user, project )
    project.numberFollows += 1
    await addProjectFollow( `test-table`, secondary_user, project )
    project.numberFollows += 1
    const result = await removeProject( `test-table`, project )
    expect( result.project ).toEqual( project )
    expect( { ...result.followers[0], dateFollowed: undefined } ).toEqual(
      { ...projectFollow, dateFollowed: undefined }
    )
    expect( { ...result.followers[1], dateFollowed: undefined } ).toEqual(
      { ...secondary_projectFollow, dateFollowed: undefined }
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
    await addBlog( `test-table`, blog )
    let result = await addProject( `test-table`, project )
    result = await incrementNumberProjectFollows( `test-table`, result.project )
    project.numberFollows += 1
    expect( result.project ).toEqual( project )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const result = await incrementNumberProjectFollows( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
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
    await addBlog( `test-table`, new Blog( {} ) )
    let result = await addProject( `test-table`, project )
    result = await decrementNumberProjectFollows( 
      `test-table`, result.project 
    )
    project.numberFollows -= 1
    expect( result.project ).toEqual( project )
  } )

  test( `Returns error when no project is in the table`, async () => {
    const result = await decrementNumberProjectFollows( `test-table`, project )
    expect( result ).toEqual( { 'error': `Project does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
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
