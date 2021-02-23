const {
  addBlog, getUser, getProject, addUser, addProject,
  addProjectFollow, removeProjectFollow
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

describe( `addProjectFollow`, () => {
  test( `A user can follow a project`, async () => {
    const projectFollow = new ProjectFollow( {
      username, name, email, slug, title
    } )
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const project_response = await addProject( `test-table`, project )
    result = await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )
    expect( { ...result.projectFollow, dateFollowed: undefined } ).toEqual( { 
      ...projectFollow, dateFollowed: undefined
    } )
  } )

  test( `Returns an error when already following the project`, async () => {
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const project_response = await addProject( `test-table`, project )
    await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )
    result = await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )   
    expect( result ).toEqual( {
      error: `'Tyler' is already following 'Tyler Norlund'`
    } )
  } )

  test( `Returns an error when the project does not exist`, async () => {
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const result = await addProjectFollow( 
      `test-table`, user_response.user, project
    )
    expect( result ).toEqual( {
      error: `Project does not exist`
    } )
  } )

  test( `Returns an error when the user does not exist`, async () => {
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    const result = await addProjectFollow( 
      `test-table`, user, project
    )
    expect( result ).toEqual( {
      error: `User does not exist`
    } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      addProjectFollow( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      addProjectFollow( `test-table`, user )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addProjectFollow()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `removeProjectFollow`, () => {
  test( `A user can remove their follow from a project`, async () => {
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const project_response = await addProject( `test-table`, project )
    await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )
    const result = await removeProjectFollow(
      `test-table`, user_response.user, project_response.project 
    )
    expect( result ).toEqual( { user, project } )
  } )

  test( `Returns an error when not following the project`, async () => {
    const secondary_user_name = `Joe`
    const secondary_user_email = `joe@me.com`
    const secondary_user_username = `11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000`
    const secondary_slug = `/b`
    const secondary_title = `Project B`
    const secondary_user = new User( {
      name: secondary_user_name, 
      email: secondary_user_email, 
      username: secondary_user_username
    } ) 
    const secondary_project = new Project( { 
      slug: secondary_slug, 
      title: secondary_title
    } )
    await addBlog( `test-table`, blog )
    await addUser( `test-table`, user )
    await addUser( `test-table`, secondary_user )
    await addProject( `test-table`, project )
    await addProject( `test-table`, secondary_project )
    await addProjectFollow( `test-table`, user, secondary_project )
    await addProjectFollow( `test-table`, secondary_user, project )
    const project_response = await getProject( `test-table`, project )
    const user_response = await getUser( `test-table`, user )
    const result = await removeProjectFollow(
      `test-table`, user_response.user, project_response.project 
    )
    expect( result ).toEqual( {
      error: `'Tyler' is not following 'Tyler Norlund'`
    } )
  } )

  test( `Returns an error when the project does not exist`, async () => {
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const result = await removeProjectFollow( 
      `test-table`, user_response.user, project
    )
    expect( result ).toEqual( { error: `Project does not exist` } )
  } )

  test( `Returns an error when the user does not exist`, async () => {
    const secondary_user_name = `Joe`
    const secondary_user_email = `joe@me.com`
    const secondary_user_username = `11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000`
    const secondary_user = new User( {
      name: secondary_user_name, 
      email: secondary_user_email, 
      username: secondary_user_username
    } ) 
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    await addUser( `test-table`, secondary_user )
    await addProjectFollow( `test-table`, secondary_user, project )
    const result = await removeProjectFollow( 
      `test-table`, user, project
    )
    expect( result ).toEqual( { error: `User does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      removeProjectFollow( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      removeProjectFollow( `test-table`, user )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      removeProjectFollow()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )