/* eslint-disable-line */ 
const aws = require( `aws-sdk` )

exports.handler = async ( event, context, callback ) => {
  console.log( {event} )
  const cognitoidentityserviceprovider =
    new aws.CognitoIdentityServiceProvider( { 
      apiVersion: `2016-04-18` 
    } )
  const groupParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
  }

  const addUserParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  }

  try {
    console.log( {groupParam} )
    await cognitoidentityserviceprovider.getGroup( groupParams ).promise()
  } catch ( error ) {
    console.log( { error } )
    await cognitoidentityserviceprovider.createGroup( groupParams ).promise()
  }

  try {
    console.log( { addUserParams } )
    await cognitoidentityserviceprovider
      .adminAddUserToGroup( addUserParams ).promise()
    callback( null, event )
  } catch ( e ) {
    callback( e )
  }
}
