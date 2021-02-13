const AWS = require( `aws-sdk` )

/**
 * In order to properly mock AWS locally, the AWS config needs to be set
 * properly. This means setting the region to `local` and pointing the endpoint
 * to docker. Docker defaults to port 8000.
 */
AWS.config.update( {
  region: `local`,
  endpoint: `http://localhost:8000`,
  accessKeyId: `dummy`,
  secretAccessKey: `dummy`
} )

/**
 * Before each test, the table needs to be created. This is to ensure that each
 * test has the same, clean environment to conduct its tests in.
 */
beforeEach(
  async () => {
    try {
      await new AWS.DynamoDB().createTable( {
        TableName: `test-table`,
        KeySchema: [
          { 'AttributeName': `PK`, 'KeyType': `HASH` },
          { 'AttributeName': `SK`, 'KeyType': `RANGE` }
        ],
        AttributeDefinitions: [
          { 'AttributeName': `PK`, 'AttributeType': `S` },
          { 'AttributeName': `SK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI1PK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI1SK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI2PK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI2SK`, 'AttributeType': `S` }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        GlobalSecondaryIndexes:[
          {
            'IndexName': `GSI1`,
            'KeySchema': [
              { 'AttributeName': `GSI1PK`, 'KeyType': `HASH` },
              { 'AttributeName': `GSI1SK`, 'KeyType': `RANGE` }
            ],
            'Projection': { 'ProjectionType': `ALL` },
            'ProvisionedThroughput': {
              'ReadCapacityUnits': 5,
              'WriteCapacityUnits': 5
            }
          },
          {
            'IndexName': `GSI2`,
            'KeySchema': [
              { 'AttributeName': `GSI2PK`, 'KeyType': `HASH` },
              { 'AttributeName': `GSI2SK`, 'KeyType': `RANGE` }
            ],
            'Projection': { 'ProjectionType': `ALL` },
            'ProvisionedThroughput': {
              'ReadCapacityUnits': 5,
              'WriteCapacityUnits': 5
            }
          },
        ]
      } ).promise()
    } catch( error ) {
      console.log( `Error beforeAll`, error )
    }
  } )

/**
 * After each test, the table needs to be deleted. This is to ensure that there
 * are no problems when the table is constructed for the following test.
 */
afterEach(
  async () => {
    try {
      const client = new AWS.DynamoDB()
      await client.deleteTable( { TableName: `test-table` } ).promise()
    } catch( error ) {
      console.log( `error afterAll`, error )
    }
  }
)

module.exports = AWS