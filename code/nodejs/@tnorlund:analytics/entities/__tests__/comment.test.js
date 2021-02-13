const { Comment, commentFromItem } = require( `..` )
const { ZeroPadNumber } = require( `../utils` )

const userNumber = 1
const userCommentNumber = 1
const userName = `Johnny Appleseed`
const slug = `/`
const text = `This is the comment text`
const dateAdded = new Date()
const baseCommentDate = new Date()

const validComments = [
  { userNumber, userCommentNumber, userName, slug, text, dateAdded },
  { userNumber, userCommentNumber, userName, slug, text, vote: `0`, dateAdded },
  { userNumber, userCommentNumber, userName, slug, text, vote: `0`, dateAdded },
  { userNumber, userCommentNumber, userName, slug, text, vote: `0`, numberVotes: `0`, dateAdded },
  { userNumber, userCommentNumber, userName, slug, text, vote: `0`, numberVotes: `0`, dateAdded, replyChain:[baseCommentDate] },
]

const invalidComments = [
  { userCommentNumber, userName, slug, text, dateAdded },
  { userNumber, userName, slug, text, dateAdded },
  { userNumber, userCommentNumber, slug, text, dateAdded },
  { userNumber, userCommentNumber, userName, text, dateAdded },
  { userNumber, userCommentNumber, userName, slug, dateAdded },
  { userNumber, userCommentNumber, userName, slug, text, numberVotes: `-1`, dateAdded },
  { userNumber, userCommentNumber, userName, slug, text, dateAdded, replyChain:`none` },
  { userNumber, userCommentNumber, userName, slug, text, dateAdded, replyChain:[`none`] },
  { userNumber, userCommentNumber, userName, slug, text, dateAdded, replyChain:[0] }
]

describe( `comment object`, () => {
  test.each( validComments )(
    `valid constructor`,
    parameter => {
      const comment = new Comment( parameter )
      expect( comment.userNumber ).toEqual( userNumber )
      expect( comment.userCommentNumber ).toEqual( userCommentNumber )
      expect( comment.userName ).toEqual( userName )
      expect( comment.slug ).toEqual( slug )
      expect( comment.text ).toEqual( text )
      expect( comment.vote ).toEqual( 0 )
      expect( comment.numberVotes ).toEqual( 0 )
      expect( comment.dateAdded ).toEqual( dateAdded )
    }
  )
  
  test( `valid constructor`, 
    () => {
      const comment = new Comment( { userNumber, userCommentNumber, userName, slug, text } ) 
      expect( comment.userNumber ).toEqual( userNumber )
      expect( comment.userCommentNumber ).toEqual( userCommentNumber )
      expect( comment.userName ).toEqual( userName )
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
      userNumber, userCommentNumber, userName, slug, text, dateAdded
    } ).pk() ).toEqual( {
      'S': `USER#${ ZeroPadNumber( userNumber ) }`
    } )
  } )
  
  test( `key`, () => { 
    expect( new Comment( {
      userNumber, userCommentNumber, userName, slug, text, dateAdded
    } ).key() ).toEqual( {
      'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
      'SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` }
    } )
  } )
  
  test( `gsi1pk`, () => { 
    expect( new Comment( {
      userNumber, userCommentNumber, userName, slug, text, dateAdded
    } ).gsi1pk() ).toEqual( {
      'S': `POST#${ slug }`
    } )
  } )
  
  test( `gsi1`,  () => { 
    expect( new Comment( {
      userNumber, userCommentNumber, userName, slug, text, dateAdded
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` }
    } )
    expect( new Comment( {
      userNumber, userCommentNumber, userName, slug, text, dateAdded, replyChain: [baseCommentDate]
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }#COMMENT#${ baseCommentDate.toISOString() }` }
    } )
    expect( new Comment( {
      userNumber, userCommentNumber, userName, slug, text, dateAdded, replyChain: [baseCommentDate.toISOString()]
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }#COMMENT#${ baseCommentDate.toISOString() }` }
    } )
  } )
  
  test( `toItem`, () => {
    const comment = new Comment( { userNumber, userCommentNumber, userName, slug, text, dateAdded } )
    expect( comment.toItem() ).toStrictEqual( {
      'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
      'SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` },
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#COMMENT#${ dateAdded.toISOString() }` },
      'Type': { 'S': `comment` },
      'User': { 'S': userName },
      'Text': { 'S': text },
      'Vote': { 'N':`0` },
      'NumberVotes': { 'N': `0` },
      'Slug': { 'S': slug },
      'UserCommentNumber': { 'N': String( userCommentNumber ) },
      'DateAdded': { 'S': dateAdded.toISOString() }
    } )
  } )
  
  test( `commentFromItem`, () => {
    const comment = new Comment( { userNumber, userCommentNumber, userName, slug, text, dateAdded } )
    expect( commentFromItem( comment.toItem() ) ).toStrictEqual( comment )
  } )
} )

