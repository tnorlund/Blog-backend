const { Vote, voteFromItem } = require( `..` )
const { ZeroPadNumber } = require( `../utils` )

const userNumber = 1
const userName = `Johnny Appleseed`
const slug = `/`
const voteNumber = 1
const up = true
const dateAdded = new Date()
const baseCommentDate = new Date()

const validVotes = [
  { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] },
  { userNumber, userName, slug, voteNumber, up, dateAdded: dateAdded.toISOString(), replyChain: [baseCommentDate] },
  { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] },
  { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate.toISOString()] }
]

const invalidVotes = [
  {},
  { userNumber: `something` },
  { userNumber: `-1` },
  { userNumber },
  { userNumber, userName },
  { userNumber, userName, slug },
  { userNumber, userName, slug, voteNumber: `something` },
  { userNumber, userName, slug, voteNumber: `-1` },
  { userNumber, userName, slug, voteNumber },
  { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [] },
  { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: `something` },
  { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [{}] }
]

describe( `vote object`, () => {
  test.each( validVotes )(
    `valid constructor`,
    parameter => {
      const vote = new Vote( parameter )
      expect( vote.userNumber ).toEqual( userNumber )
      expect( vote.userName ).toEqual( userName )
      expect( vote.slug ).toEqual( slug )
      expect( vote.voteNumber ).toEqual( voteNumber )
      expect( vote.up ).toEqual( up )
      expect( vote.dateAdded ).toEqual( dateAdded )
    }
  )

  test.each( invalidVotes )(
    `invalid constructor`,
    parameter => expect( () => new Vote( parameter ) ).toThrow()
  )

  test( `pk`, () => {
    expect( new Vote( { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] } ).pk() ).toEqual( {
      'S': `USER#${ ZeroPadNumber( userNumber ) }`
    } )
  } )

  test( `key`, () => {
    expect( new Vote( { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] } ).key() ).toEqual( {
      'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
      'SK': { 'S': `#VOTE#${ dateAdded.toISOString() }` }
    } )
  } )

  test( `gsi1pk`, () => {
    expect( new Vote( { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] } ).gsi1pk() ).toEqual( {
      'S': `POST#${ slug }`
    } )
  } )

  test( `gsi1`, () => {
    expect( new Vote( { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 'S': `#COMMENT#${ baseCommentDate.toISOString() }#VOTE#${ dateAdded.toISOString() }` }
    } )
  } )

  test( `toItem`, () => expect( new Vote( { userNumber, userName, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] } ).toItem() ).toEqual( {
    'PK': { 'S': `USER#${ ZeroPadNumber( userNumber ) }` },
    'SK': { 'S': `#VOTE#${ dateAdded.toISOString() }` },
    'GSI1PK': { 'S': `POST#${ slug }` },
    'GSI1SK': { 'S': `#COMMENT#${ baseCommentDate.toISOString() }#VOTE#${ dateAdded.toISOString() }` },
    'Type': { 'S': `vote` },
    'UserName': { 'S': userName },
    'Slug': { 'S': slug },
    'VoteNumber': { 'N': voteNumber.toString() },
    'Up': { 'BOOL': up },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `voteFromItem`, () => {
    const first_date = new Date()
    const second_date = new Date()
    const vote = new Vote( { 
      userNumber, userName, slug, voteNumber, up, dateAdded, 
      replyChain: [first_date, second_date] 
    } )
    expect( voteFromItem( vote.toItem() ) ).toEqual( vote )
  } )
} )