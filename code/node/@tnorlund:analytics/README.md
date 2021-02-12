# aws-analytics-js

A package for accessing the Blog DB using Node.

# Data Model

## Blog
- **NumberUsers**: `Number` The number of users found on the blog
- **NumberPosts**: `Number` The number of posts found on the blog
- **NumberProjects**: `Number` The number of projects found on the blog

## Test

In order to test locally, you need to install docker and this 'package.json'. With those out of the way, install the local DynamoDB container, `docker pull amazon/dynamodb-local`.

With all of the dependencies, run the local DynamoDB, `docker run -p 8000:8000 amazon/dynamodb-local` and run jest, `jest --runInBand`.