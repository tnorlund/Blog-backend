const { ZeroPadNumber, parseDate, isIP, variableToItemAttribute, mappingToObject } = require( `../utils` )

describe( `utility functions`, () => {
  describe( `zeroPadNumber`, () => {
    test( `valid parameter`, () => expect( ZeroPadNumber( 0 ) ).toEqual( `000000` ) )
    test( `valid parameter`, () => expect( ZeroPadNumber( 1 ) ).toEqual( `000001` ) )
    test( `valid parameter`, () => expect( ZeroPadNumber( `1` ) ).toEqual( `000001` ) )
    test( `invalid parameter`, () => expect( () => ZeroPadNumber( `something` ) ).toThrow() )
    test( `invalid parameter`, () => expect( () => ZeroPadNumber( `-1` ) ).toThrow() )
    test( `invalid parameter`, () => expect( () => ZeroPadNumber( 0, `something` ) ).toThrow() )
    test( `invalid parameter`, () => expect( () => ZeroPadNumber( 0, `-1` ) ).toThrow() )
  } )

  describe( `parseDate`, () => {
    const date = new Date()
    test( `valid parameter`, () => expect( parseDate( date.toISOString() ) ).toEqual( date ) )
    test( `invalid parameter`, () => expect( () => parseDate( `something` ) ).toThrow() )
  } )

  describe( `isIP`, () => {
    test( `valid parameter`, () => expect( isIP( `0.0.0.0` ) ).toEqual( true ) )
    test( `valid parameter`, () => expect( isIP( `something` ) ).toEqual( false ) )
    test( `invalid parameter`, () => expect( () => isIP( {} ) ).toThrow() )
  } )

  describe( `variableToItemAttribute`, () => {
    test( `string`, () => expect( variableToItemAttribute( `something` ) ).toEqual( { 'S': `something` } ) )
    test( `empty string`, () => expect( variableToItemAttribute( `` ) ).toEqual( { 'NULL': true } ) )
    test( `none string`, () => expect( variableToItemAttribute( `None` ) ).toEqual( { 'NULL': true } ) )
    test( `boolean`, () => expect( variableToItemAttribute( true ) ).toEqual( { 'BOOL': true } ) )
    test( `number array`, () => expect( variableToItemAttribute( [ 1, 2, 3 ] ) ).toEqual( { 'NS': [ `1`, `2`, `3` ] } ) )
    test( `number array`, () => expect( variableToItemAttribute( [ `1`, `2`, `3` ] ) ).toEqual( { 'NS': [ `1`, `2`, `3` ] } ) )
    test( `string array`, () => expect( variableToItemAttribute( [ `something`, `something`, `something` ] ) ).toEqual( { 'SS': [ `something`, `something`, `something` ] } ) )
    test( `map`, () => expect( variableToItemAttribute( { 'First': 1, 'Second': `something`} ) ).toEqual( { 'M': { 'First': { 'N': `1` }, 'Second': { 'S': `something` } } } ) )
  } )

  describe( `mappingToObject`, () => {
    const dynamo_map = { 'M': {
      'Name': { 'S': `Tyler` },
      'Age': { 'N': 1 },
      'Social': { 'NULL': true }
    } }
    test( `mapping`, () => expect( mappingToObject( dynamo_map.M ) ).toEqual( { 'Name': `Tyler`, 'Age': 1, 'Social': undefined } ) )
  } )
} )