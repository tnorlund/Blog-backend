output "firehose_arn" {
  value = aws_kinesis_firehose_delivery_stream.extended_s3_stream.arn
}