const { Comment, commentFromItem } = require( `..` )
const { ZeroPadNumber } = require( `../utils` )

const username = `4ec5a264-733d-4ee5-b59c-7911539e3942`
const userCommentNumber = 1
const name = `Johnny Appleseed`
const slug = `/`
const text = `This is the comment text`
const dateAdded = new Date()
const baseCommentDate = new Date()

const validComments = [
  { username, userCommentNumber, name, slug, text, dateAdded },
  { username, userCommentNumber, name, slug, text, vote: `0`, dateAdded },
  { username, userCommentNumber, name, slug, text, vote: `0`, dateAdded },
  { 
    username, 
    userCommentNumber, 
    name, 
    slug, 
    text, 
    vote: `0`, 
    numberVotes: `0`, 
    dateAdded 
  },
  { 
    username, 
    userCommentNumber, 
    name, 
    slug, 
    text, 
    vote: `0`, 
    numberVotes: `0`, 
    dateAdded, 
    replyChain:[baseCommentDate] 
  },
]

const invalidComments = [
  { userCommentNumber, name, slug, text, dateAdded },
  { username, name, slug, text, dateAdded },
  { username, userCommentNumber, slug, text, dateAdded },
  { username, userCommentNumber, name, text, dateAdded },
  { username, userCommentNumber, name, slug, dateAdded },
  { 
    username, 
    userCommentNumber, 
    name, 
    slug, 
    text, 
    numberVotes: `-1`, 
    dateAdded 
  },
  { 
    username, 
    userCommentNumber, 
    name, 
    slug, 
    text, 
    dateAdded, 
    replyChain:`none` 
  },
  { 
    username, 
    userCommentNumber, 
    name, 
    slug, 
    text, 
    dateAdded, 
    replyChain:[`none`] 
  },
  { username, userCommentNumber, name, slug, text, dateAdded, replyChain:[0] }
]

describe( `comment object`, () => {
  test.each( validComments )(
    `valid constructor`,
    parameter => {
      const comment = new Comment( parameter )
      expect( comment.username ).toEqual( username )
      expect( comment.userCommentNumber ).toEqual( userCommentNumber )
      expect( comment.name ).toEqual( name )
      expect( comment.slug ).toEqual( slug )
      expect( comment.text ).toEqual( text )
      expect( comment.vote ).toEqual( 0 )
      expect( comment.numberVotes ).toEqual( 0 )
      expect( comment.dateAdded ).toEqual( dateAdded )
    }
  )
  
  test( `valid constructor`, 
    () => {
      const comment = new Comment( { 
        username, userCommentNumber, name, slug, text 
      } ) 
      expect( comment.username ).toEqual( username )
      expect( comment.userCommentNumber ).toEqual( userCommentNumber )
      expect( comment.name ).toEqual( name )
      expect( comment.slug ).toEqual( slug )
      expect( comment.text ).toEqual( text )
      expect( comment.vote ).toEqual( 0 )
      expect( comment.numberVotes ).toEqual( 0 )
    }
  )
  
  test.each( invalidComments )(
    `invalid constructor`,
    parameter => expect( () => new Comment( parameter ) ).toThrow()
  )
  
  test( `pk`, () => { 
    expect( new Comment( {
      username, userCommentNumber, name, slug, text, dateAdded
    } ).pk() ).toEqual( {
      'S': `USER#${ username }`
    } )
  } )
  
  test( `key`, () => { 
    expect( new Comment( {
      username, userCommentNumber, name, slug, text, dateAdded
    } ).key() ).toEqual( {
      'PK': { 'S': `USER#${ username }` },
      'SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` }
    } )
  } )
  
  test( `gsi1pk`, () => { 
    expect( new Comment( {
      username, userCommentNumber, name, slug, text, dateAdded
    } ).gsi1pk() ).toEqual( {
      'S': `POST#${ slug }`
    } )
  } )
  
  test( `gsi1`,  () => { 
    expect( new Comment( {
      username, userCommentNumber, name, slug, text, dateAdded
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` }
    } )
    expect( new Comment( {
      username, 
      userCommentNumber, 
      name, 
      slug, 
      text, 
      dateAdded, 
      replyChain: [baseCommentDate]
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 
        'S': `#COMMENT#${ 
          dateAdded.toISOString() 
        }#COMMENT#${ 
          baseCommentDate.toISOString() 
        }` 
      }
    } )
    expect( new Comment( {
      username, 
      userCommentNumber, 
      name, 
      slug, 
      text, 
      dateAdded, 
      replyChain: [baseCommentDate.toISOString()]
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 
        'S': `#COMMENT#${ 
          dateAdded.toISOString() 
        }#COMMENT#${ baseCommentDate.toISOString() }` 
      }
    } )
  } )
  
  test( `toItem`, () => {
    const comment = new Comment( { 
      username, userCommentNumber, name, slug, text, dateAdded 
    } )
    expect( comment.toItem() ).toStrictEqual( {
      'PK': { 'S': `USER#${ username }` },
      'SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` },
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` },
      'Type': { 'S': `comment` },
      'Name': { 'S': name },
      'Text': { 'S': text },
      'Vote': { 'N':`0` },
      'NumberVotes': { 'N': `0` },
      'Slug': { 'S': slug },
      'UserCommentNumber': { 'N': String( userCommentNumber ) },
      'DateAdded': { 'S': dateAdded.toISOString() }
    } )
  } )
  
  test( `commentFromItem`, () => {
    const comment = new Comment( { 
      username, userCommentNumber, name, slug, text, dateAdded 
    } )
    expect( commentFromItem( comment.toItem() ) ).toStrictEqual( comment )
  } )
} )

