output "firehose_arn" {
  value = aws_kinesis_firehose_delivery_stream.extended_s3_stream.arn
}

output "dynamo_table_name" {
  value = aws_dynamodb_table.table.name
}

output "dynamo_arn" {
  value = aws_dynamodb_table.table.arn
  description = "The ARN of the DynamoDB table"
}

output "firehose_stream_name" {
  value = aws_kinesis_firehose_delivery_stream.extended_s3_stream.name
}