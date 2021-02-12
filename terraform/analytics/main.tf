# Analytics
#
# This module creates a Kinesis Firehose Stream that is processed and stored in
# both DynamoDB and S3.

# Create the DynamoDB table
resource "aws_dynamodb_table" "table" {
  name             = "${var.table_name}_${var.stage}"
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
    Stage     = var.stage
    Developer = var.developer
  }
}


# Use a Lambd Function to process the DynamoDB stream
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
data "archive_file" "dynamo" {
  type        = "zip"
  source_file = "${var.dynamo_path}/${var.dynamo_file_name}.js"
  output_path = "${var.dynamo_path}/${var.dynamo_file_name}.zip"
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
resource "aws_lambda_function" "dynamo_db_stream" {
  filename          = "${var.dynamo_path}/${var.dynamo_file_name}.zip"
  function_name     = "dynamodb-lambda-stream-${var.stage}"
  role              = aws_iam_role.lambda_role.arn
  handler           = "${var.dynamo_file_name}.handler"
  source_code_hash  = filebase64sha256("${var.dynamo_path}/${var.dynamo_file_name}.zip")
  runtime           = "nodejs12.x"
  environment {
    variables = {
      IPIFY_KEY = var.ipify_key
      TABLE_NAME = "${var.table_name}_${var.stage}"
    }
  }
  tags = {
    Project   = "Blog"
    Stage     = var.stage
    Developer = var.developer
  }
}
resource "aws_lambda_event_source_mapping" "dynamo_mapping" {
  batch_size        = 100
  event_source_arn  = aws_dynamodb_table.table.stream_arn
  enabled           = true
  function_name     = aws_lambda_function.dynamo_db_stream.arn
  starting_position = "TRIM_HORIZON"
  depends_on        = [ aws_lambda_function.dynamo_db_stream, aws_dynamodb_table.table ]
}

# Create an S3 Bucket to store the Kinesis data
resource "aws_s3_bucket" "bucket" {
  bucket = "blog-analytics-${var.stage}"
  acl    = "private"
  tags = {
    Project   = "Blog"
    Stage     = var.stage
    Developer = var.developer
  }
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
data "archive_file" "kinesis" {
  type = "zip"
  source_file = "${var.kinesis_path}/${var.kinesis_file_name}.js"
  output_path = "${var.kinesis_path}/${var.kinesis_file_name}.zip"
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
resource "aws_lambda_function" "kinesis_processor" {
  filename          = "${var.kinesis_path}/${var.kinesis_file_name}.zip"
  function_name     = "firehose-lambda-processor-${var.stage}"
  role              = aws_iam_role.kinesis.arn
  handler           = "${var.kinesis_file_name}.handler"
  source_code_hash  = filebase64sha256(
    "${var.kinesis_path}/${var.kinesis_file_name}.zip"
  )
  runtime           = "nodejs12.x"
  layers            = [ var.layer_arn ]
  memory_size       = 256
  timeout           = 60
  environment {
    variables = {
      IPIFY_KEY = var.ipify_key
      TABLE_NAME = "${var.table_name}_${var.stage}"
    }
  }
  tags              = {
    Project   = "Blog"
    Stage     = var.stage
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
  name        = "tylernorlund_blog_analytics_${var.stage}"
  destination = "extended_s3"
  

  extended_s3_configuration {
    cloudwatch_logging_options {
      log_group_name = "/aws/lambda/tylernorlund_blog_analytics_${var.stage}"
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
  name              = "/aws/lambda/tylernorlund_blog_analytics_${var.stage}"
  retention_in_days = 14
}
resource "aws_cloudwatch_log_group" "processor" {
  name              = "/aws/lambda/firehose-lambda-processor-${var.stage}"
  retention_in_days = 14
}
