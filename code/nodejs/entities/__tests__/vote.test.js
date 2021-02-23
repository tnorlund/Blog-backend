const { Vote, voteFromItem } = require( `..` )
const { updateUserName } = require("../../data/user")
const { ZeroPadNumber } = require( `../utils` )

const username = `4ec5a264-733d-4ee5-b59c-7911539e3942`
const name = `Johnny Appleseed`
const slug = `/`
const voteNumber = 1
const up = true
const dateAdded = new Date()
const baseCommentDate = new Date()

const validVotes = [
  { username, name, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] },
  { username, name, slug, voteNumber, up, dateAdded: dateAdded.toISOString(), replyChain: [baseCommentDate] },
  { username, name, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate] },
  { username, name, slug, voteNumber, up, dateAdded, replyChain: [baseCommentDate.toISOString()] }
]

const invalidVotes = [
  {},
  { username: `something` },
  { username: `-1` },
  { username },
  { username, name },
  { username, name, slug },
  { username, name, slug, voteNumber: `something` },
  { username, name, slug, voteNumber: `-1` },
  { username, name, slug, voteNumber },
  { username, name, slug, voteNumber, up, dateAdded, replyChain: [] },
  { username, name, slug, voteNumber, up, dateAdded, replyChain: `something` },
  { username, name, slug, voteNumber, up, dateAdded, replyChain: [{}] }
]

describe( `vote object`, () => {
  test.each( validVotes )(
    `valid constructor`,
    parameter => {
      const vote = new Vote( parameter )
      expect( vote.username ).toEqual( username )
      expect( vote.name ).toEqual( name )
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
    expect( new Vote( { 
        username, 
        name, 
        slug, 
        voteNumber, 
        up, 
        dateAdded, 
        replyChain: [baseCommentDate]
    } ).pk() ).toEqual( { 'S': `USER#${ username }` } )
  } )

  test( `key`, () => {
    expect( new Vote( { 
      username,
      name,
      slug,
      voteNumber,
      up,
      dateAdded,
      replyChain: [baseCommentDate] 
    } ).key() ).toEqual( {
      'PK': { 'S': `USER#${ username }` },
      'SK': { 'S': `#VOTE#${ dateAdded.toISOString() }` }
    } )
  } )

  test( `gsi1pk`, () => {
    expect( new Vote( { 
      username,
      name,
      slug,
      voteNumber,
      up,
      dateAdded,
      replyChain: [baseCommentDate] 
    } ).gsi1pk() ).toEqual( {
      'S': `POST#${ slug }`
    } )
  } )

  test( `gsi1`, () => {
    expect( new Vote( { 
      username,
      name,
      slug,
      voteNumber,
      up,
      dateAdded,
      replyChain: [baseCommentDate] 
    } ).gsi1() ).toEqual( {
      'GSI1PK': { 'S': `POST#${ slug }` },
      'GSI1SK': { 
        'S': `#COMMENT#${ 
          baseCommentDate.toISOString() 
        }#VOTE#${ 
          dateAdded.toISOString() 
        }` 
      }
    } )
  } )

  test( `toItem`, () => expect( new Vote( { 
    username, 
    name, 
    slug, 
    voteNumber, 
    up, 
    dateAdded, 
    replyChain: [baseCommentDate] } ).toItem() 
  ).toEqual( {
    'PK': { 'S': `USER#${ username }` },
    'SK': { 'S': `#VOTE#${ dateAdded.toISOString() }` },
    'GSI1PK': { 'S': `POST#${ slug }` },
    'GSI1SK': { 
      'S': `#COMMENT#${ 
        baseCommentDate.toISOString() 
      }#VOTE#${ dateAdded.toISOString() }` 
    },
    'Type': { 'S': `vote` },
    'Name': { 'S': name },
    'Slug': { 'S': slug },
    'VoteNumber': { 'N': voteNumber.toString() },
    'Up': { 'BOOL': up },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `voteFromItem`, () => {
    const first_date = new Date()
    const second_date = new Date()
    const vote = new Vote( { 
      username, name, slug, voteNumber, up, dateAdded, 
      replyChain: [first_date, second_date] 
    } )
    expect( voteFromItem( vote.toItem() ) ).toEqual( vote )
  } )
} )