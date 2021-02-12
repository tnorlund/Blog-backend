const { 
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogPosts, decrementNumberBlogPosts, 
  incrementNumberBlogProjects, decrementNumberBlogProjects,
  incrementNumberBlogUsers, decrementNumberBlogUsers
} = require( `..` )
const { Blog } = require( `../../entities` )


describe( `addBlog`, () => {
  test( `A default blog can be added to the table`, async () => {
    const blog = new Blog( {} )
    const result = await addBlog( `test-table`, blog )
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Blog with specific attributes can be added to the table`,
    async () => {
      const blog = new Blog( {
        numberUsers: 1, numberPosts: 1, numberProjects: 1
      } )
      const result = await addBlog( `test-table`, blog )
      expect( result ).toEqual( { 'blog': blog } )
    }
  )

  test( `Returns error when a blog is in the table`, async () => {
    const blog = new Blog( { } )
    let result = await addBlog( `test-table`, blog )
    result = await addBlog( `test-table`, blog )
    expect( result ).toEqual( { 'error': `Blog already exists` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await addBlog( `table-not-exist`, new Blog( {} ) )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no blog object is given`, async () => {
    await expect(
      addBlog( `test-table` )
    ).rejects.toThrow( `Must give blog` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addBlog()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getBlog`, () => {
  test( `A blog can be queried from the table`, async () => {
    const blog = new Blog( {} )
    let result = await addBlog( `test-table`, blog )
    result = await getBlog( `test-table` )
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await getBlog( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await getBlog( `not-a-table` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getBlog()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `resetBlog`, () => {
  test( `The blog's attributes can be reset`, async () => {
    const blog = new Blog( { 
      numberPosts: 5, numberProjects: 5, numberUsers: 5
    } )
    await addBlog( `test-table`, blog )
    const result = await resetBlog( `test-table` )
    expect( result ).toEqual( { 'blog': new Blog( {} ) } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await resetBlog( `table-not-exist` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  test( `Returns error when no blog is in the table`, async () => {
    const result = await resetBlog( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Throws an error when no table name is given`, async () => {
    await expect( resetBlog() ).rejects.toThrow( 
      `Must give the name of the DynamoDB table` 
    )
  } )
} )

describe( `updateBlog`, () => {
  test( `The blog's attributes can be updated`, async () => {
    const blog = new Blog( { 
      numberPosts: 5, numberProjects: 5, numberUsers: 5
    } )
    await addBlog( `test-table`, blog )
    const result = await updateBlog( `test-table`, blog )
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await updateBlog( `table-not-exist`, new Blog( {} ) )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  test( `Returns error when no blog is in the table`, async () => {
    const blog = new Blog( { } )
    const result = await updateBlog( `test-table`, blog )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Throws an error when no blog object is given`, async () => {
    await expect(
      updateBlog( `test-table` )
    ).rejects.toThrow( `Must give blog` )
  } )

  test( `Throws an error when no table name is given`, async () => {
    await expect( updateBlog() ).rejects.toThrow( 
      `Must give the name of the DynamoDB table` 
    )
  } )  
} )

describe( `incrementNumberBlogPosts`, () => {
  test( `The number of posts the blog has can be incremented`, async () => { 
    let blog = new Blog( {} )
    await addBlog( `test-table`, blog )
    const result = await incrementNumberBlogPosts( `test-table` )
    blog.numberPosts += 1
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await incrementNumberBlogPosts( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await incrementNumberBlogPosts( `not-a-table` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberBlogPosts()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberBlogPosts`, () => {
  test( `The number of posts the blog has can be decremented`, async () => { 
    let blog = new Blog( { numberPosts: 5 } )
    await addBlog( `test-table`, blog )
    const result = await decrementNumberBlogPosts( `test-table` )
    blog.numberPosts -= 1
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await decrementNumberBlogPosts( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await decrementNumberBlogPosts( `not-a-table` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberBlogPosts()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberBlogProjects`, () => {
  test( `The number of projects the blog has can be incremented`, async () => { 
    let blog = new Blog( {} )
    await addBlog( `test-table`, blog )
    const result = await incrementNumberBlogProjects( `test-table` )
    blog.numberProjects += 1
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await incrementNumberBlogProjects( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await incrementNumberBlogProjects( `not-a-table` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberBlogProjects()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberBlogProjects`, () => {
  test( `The number of projects the blog has can be decremented`, async () => { 
    let blog = new Blog( { numberProjects: 5 } )
    await addBlog( `test-table`, blog )
    const result = await decrementNumberBlogProjects( `test-table` )
    blog.numberProjects -= 1
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await decrementNumberBlogProjects( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await decrementNumberBlogProjects( `not-a-table` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberBlogProjects()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberBlogUsers`, () => {
  test( `The number of users the blog has can be incremented`, async () => { 
    let blog = new Blog( {} )
    await addBlog( `test-table`, blog )
    const result = await incrementNumberBlogUsers( `test-table` )
    blog.numberUsers += 1
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await incrementNumberBlogUsers( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await incrementNumberBlogUsers( `not-a-table` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberBlogUsers()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberBlogUsers`, () => {
  test( `The number of users the blog has can be decremented`, async () => { 
    const blog = new Blog( { numberUsers: 5, numberPosts: 1 } )
    await addBlog( `test-table`, blog )
    const result = await decrementNumberBlogUsers( `test-table` )
    blog.numberUsers -= 1
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await decrementNumberBlogUsers( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await decrementNumberBlogUsers( `not-a-table` )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberBlogUsers()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )
