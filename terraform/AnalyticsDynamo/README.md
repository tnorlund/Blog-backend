# AnalyticsDynamo
This is the module that creates the Kinesis Firehose stream and the DynamoDB table. 

The Kinesis Firehose data stream processes data from the client using a Lambda Function and stores the records in an S3 bucket.

The DynamoDB table stores the site's user information and the analytics data.