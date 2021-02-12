# Node Layer

![](https://github.com/tnorlund/Blog-backend/workflows/Unit%20Tests/badge.svg)

A package for accessing the Blog DB using Node.

## Testing the Package

In order to test locally, you need to install docker and this 'package.json'. With those out of the way, install the local DynamoDB container, `docker pull amazon/dynamodb-local`.

With all of the dependencies, run the local DynamoDB, `docker run -p 8000:8000 amazon/dynamodb-local` and run jest, `jest --runInBand`.