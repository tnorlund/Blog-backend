# Lambda Code

This directory holds the code required to run the AWS Lambda Functions and Lambda Layers.

It uses both nodeJS and Python. The lambda Functions include:

## Custom Message
Emails a custom message to the user when they sign up.

## Dynamo Processor
Aggregates data on DynamoDB accesses.

## Kinesis Processor
Aggregates data on POST to Kinesis Firehose.

## REST API
Handle the REST API `POST`, `GET`, and `OPTION` calls.

## S3 Processor
Aggregates and uploads data to DynamoDB.
