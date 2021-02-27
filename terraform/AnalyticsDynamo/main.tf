# Analytics
#
# This module creates a Kinesis Firehose Stream that is processed and stored in
# both DynamoDB and S3.

# Create the DynamoDB table
resource "aws_dynamodb_table" "table" {
  name             = var.table_name
  billing_mode     = "PROVISIONED"
  read_capacity    = var.read_capacity
  write_capacity   = var.write_capacity
  hash_key         = "PK"
  range_key        = "SK"
  stream_view_type = "NEW_IMAGE"
  stream_enabled   = true

  # Partition key and sort key of the entire table
  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }

  # Partition key and sort key of the first Global Secondary Index
  attribute {
    name = "GSI1PK"
    type = "S"
  }
  attribute {
    name = "GSI1SK"
    type = "S"
  }
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    write_capacity  = var.gsi1_write_capacity
    read_capacity   = var.gsi1_read_capacity
    projection_type = "ALL"
  }

  # Partition key and sort key of the second Global Secondary Index
  attribute {
    name = "GSI2PK"
    type = "S"
  }
  attribute {
    name = "GSI2SK"
    type = "S"
  }
  global_secondary_index {
    name            = "GSI2"
    hash_key        = "GSI2PK"
    range_key       = "GSI2SK"
    write_capacity  = var.gsi2_write_capacity
    read_capacity   = var.gsi2_read_capacity
    projection_type = "ALL"
  }

  # Store the DynamoDB items for the last 35 days.
  point_in_time_recovery {
    enabled = true
  }

  # The tags related to the table.
  tags = {
    Project   = "Blog"
    Developer = var.developer
  }
}


# Use a Lambda Function to process the DynamoDB stream
data "aws_iam_policy_document" "lambda_policy_doc" {
  # The Lambda function needs accesss to the DynamoDB table and the stream.
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:UpdateItem",
      "dynamodb:GetRecords", 
      "dynamodb:GetShardIterator", 
      "dynamodb:DescribeStream", 
      "dynamodb:ListShards",
      "dynamodb:ListStreams",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "logs:CreateLogStream"
    ]
    resources = [ 
      aws_dynamodb_table.table.arn,
      aws_dynamodb_table.table.stream_arn,
      "arn:aws:logs:*" 
    ]
    sid = "codecommitid"
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "iam_dynamo_stream"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "lambda_policy" {
  policy = data.aws_iam_policy_document.lambda_policy_doc.json
  role   = aws_iam_role.lambda_role.id
}

/**
 * Get the object from S3 to see if it needs to be applied.
 */
data "aws_s3_bucket_object" "dynamo_db_stream" {
  bucket = var.bucket_name
  key    = "dynamo_processor.zip"
}
resource "aws_lambda_function" "dynamo_db_stream" {
  # filename          = "${var.dynamo_path}/${var.dynamo_file_name}.zip"
  s3_bucket         = var.bucket_name
  s3_key            = "dynamo_processor.zip"
  function_name     = "dynamodb-lambda-stream"
  role              = aws_iam_role.lambda_role.arn
  handler           = "dynamo_processor.handler"
  source_code_hash  = data.aws_s3_bucket_object.dynamo_db_stream.body
  runtime           = "nodejs12.x"
  layers            = [ var.node_layer_arn ]
  environment {
    variables = {
      IPIFY_KEY = var.ipify_key
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Project   = "Blog"
    Developer = var.developer
  }
}
resource "aws_lambda_event_source_mapping" "dynamo_mapping" {
  batch_size        = 100
  event_source_arn  = aws_dynamodb_table.table.stream_arn
  enabled           = true
  function_name     = aws_lambda_function.dynamo_db_stream.arn
  starting_position = "TRIM_HORIZON"
  depends_on        = [ 
    aws_lambda_function.dynamo_db_stream, 
    aws_dynamodb_table.table 
  ]
}

# Create an S3 Bucket to store the Kinesis data
resource "aws_s3_bucket" "bucket" {
  bucket = "blog-analytics"
  acl    = "private"
  tags = {
    Project   = "Blog"
    Developer = var.developer
  }
}

data "aws_iam_policy_document" "s3" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:BatchWriteItem",
      "s3:ListBucket",
      "s3:PutObject",
      "s3:GetObject",
      "dynamodb:UpdateItem",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "logs:CreateLogStream"
    ]
    resources = [ 
      aws_dynamodb_table.table.arn,
      "arn:aws:s3:::*/*",
      "arn:aws:logs:*" 
    ]
    sid = "lambdaS3Processor"
  }
}
resource "aws_iam_role" "s3" {
   name = "s3_process_role"

   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "s3" {
  policy = data.aws_iam_policy_document.s3.json
  role   = aws_iam_role.s3.id
}

/**
 * Get the object from S3 to see if it needs to be applied.
 */
data "aws_s3_bucket_object" "s3" {
  bucket = var.bucket_name
  key    = "s3_processor.zip"
}
resource "aws_lambda_function" "s3" {
  # filename          = "${var.s3_path}/${var.s3_file_name}.zip"
  s3_bucket         = var.bucket_name
  s3_key            = "s3_processor.zip"
  function_name     = "s3-lambda-processor"
  role              = aws_iam_role.s3.arn
  handler           = "s3_processor.s3_processor"
  source_code_hash  = data.aws_s3_bucket_object.s3.body
  runtime           = "python3.8"
  layers            = [ var.python_layer_arn ]
  memory_size       = 256
  timeout           = 60
  environment {
    variables = {
      IPIFY_KEY = var.ipify_key
      TABLE_NAME = var.table_name
    }
  }
  tags              = {
    Project   = "Blog"
    Developer = var.developer
  }
}
resource "aws_lambda_permission" "s3" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.s3.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.bucket.arn
}
resource "aws_s3_bucket_notification" "bucket_terraform_notification" {
   bucket = aws_s3_bucket.bucket.id
   lambda_function {
       lambda_function_arn = aws_lambda_function.s3.arn
       events = ["s3:ObjectCreated:Put"]
   }

   depends_on = [ aws_lambda_permission.s3 ]
}

# Create a Lambda function to process the kinesis stream
data "aws_iam_policy_document" "kinesis" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:UpdateItem",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "logs:CreateLogStream"
    ]
    resources = [ 
      aws_dynamodb_table.table.arn,
      "arn:aws:logs:*" 
    ]
    sid = "lambdaKinesisProcessor"
  }
}

resource "aws_iam_role" "kinesis" {
   name = "kinesis_process_role"

   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "lambda_processor" {
  policy = data.aws_iam_policy_document.kinesis.json
  role   = aws_iam_role.kinesis.id
}
/**
 * Get the object from S3 to see if it needs to be applied.
 */
data "aws_s3_bucket_object" "kinesis_processor" {
  bucket = var.bucket_name
  key    = "kinesis_processor.zip"
}
resource "aws_lambda_function" "kinesis_processor" {
  # filename          = "${var.kinesis_path}/${var.kinesis_file_name}.zip"
  s3_bucket         = var.bucket_name
  s3_key            = "kinesis_processor.zip"
  function_name     = "firehose-lambda-processor"
  role              = aws_iam_role.kinesis.arn
  handler           = "kinesis_processor.handler"
  source_code_hash  = data.aws_s3_bucket_object.kinesis_processor.body
  runtime           = "nodejs12.x"
  layers            = [ var.node_layer_arn ]
  memory_size       = 256
  timeout           = 60
  environment {
    variables = {
      IPIFY_KEY = var.ipify_key
      TABLE_NAME = var.table_name
    }
  }
  tags              = {
    Project   = "Blog"
    Developer = var.developer
  }
}
resource "aws_lambda_permission" "blog" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.kinesis_processor.function_name
  principal     = "firehose.amazonaws.com"
  source_arn    = aws_kinesis_firehose_delivery_stream.extended_s3_stream.arn
}

# Create the Firehose stream
data "aws_iam_policy_document" "kinesis_policy" {
  statement {
    effect="Allow"
    actions = [
      "s3:AbortMultipartUpload",
      "s3:GetBucketLocation",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:ListBucketMultipartUploads",
      "s3:PutObject",
      "lambda:InvokeFunction",
      "lambda:GetFunctionConfiguration"
    ]
    resources = [
      aws_s3_bucket.bucket.arn,
      "${aws_s3_bucket.bucket.arn}/*",
      "${aws_lambda_function.kinesis_processor.arn}:*"
    ]
    sid = "kinesisId"
  }
}
resource "aws_iam_role" "kinesis_role" {
   name = "kinesis_role"
   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "kinesis_stream" {
  policy = data.aws_iam_policy_document.kinesis_policy.json
  role   = aws_iam_role.kinesis_role.id
}
resource "aws_kinesis_firehose_delivery_stream" "extended_s3_stream" {
  name        = "tylernorlund_blog_analytics"
  destination = "extended_s3"
  

  extended_s3_configuration {
    cloudwatch_logging_options {
      log_group_name = "/aws/lambda/tylernorlund_blog_analytics"
      log_stream_name = "example_stream"
      enabled = true
    }
    role_arn   = aws_iam_role.kinesis_role.arn
    bucket_arn = aws_s3_bucket.bucket.arn
    buffer_size = 1
    buffer_interval = 60

    processing_configuration {
      enabled = "true"
      processors {
        type = "Lambda"
        parameters {
          parameter_name  = "LambdaArn"
          parameter_value = "${aws_lambda_function.kinesis_processor.arn}:$LATEST"
        }
      }
    }
  }
}
resource "aws_cloudwatch_log_group" "stream" {
  name              = "/aws/lambda/tylernorlund_blog_analytics"
  retention_in_days = 14
}
resource "aws_cloudwatch_log_group" "processor" {
  name              = "/aws/lambda/firehose-lambda-processor"
  retention_in_days = 14
}
