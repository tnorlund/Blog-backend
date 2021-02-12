const {
  addBlog, addUser,
  addTOS
} = require( `..` )
const { Blog, User, TOS } = require( `../../entities` )

describe( `addTOS`, () => {
  test( `A TOS can be added to the table`, async () => {
    let blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const version = new Date().toISOString()
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    const tos = new TOS( {
      userNumber: result.user.userNumber, version: version
    } )
    result = await addTOS( `test-table`, result.user, tos )
    expect( result ).toEqual( { tos } )
  } )

  test( `Returns an error when the TOS is in the table`, async () => {
    let blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const version = new Date().toISOString()
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    const tos = new TOS( {
      userNumber: result.user.userNumber, version: version
    } )
    await addTOS( `test-table`, result.user, tos )
    result = await addTOS( `test-table`, result.user, tos )
    expect( result ).toEqual( {
      error: `'Tyler' already accepted this Terms of Service`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const tos = new TOS( {
      userNumber: 1, version: new Date().toISOString()
    } )
    const result = await addTOS( `table-not-exist`, user, tos )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect( addTOS( `test-table` ) ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no user object is given`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    await expect( 
      addTOS( `test-table`, user ) 
    ).rejects.toThrow( `Must give terms of service` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addTOS()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )