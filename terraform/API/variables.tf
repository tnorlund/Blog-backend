variable "bucket_name" {
  type = string
  description = "The name of the S3 bucket used to hold the uploaded code"
}

variable "table_name" {
  type = string
  description = "The name of the DynamoDB table"
}

variable "developer" {
  type = string
  description = "The name of the developer making the change"
}

variable "user_pool_arn" {
  type = string
  description = "The ARN of the user pool"
}

variable "stage" {
  type = string
  default = "dev"
  description = "The stage of the production."
}

variable "api_gateway_id" {
  type = string
  description = "The ID of API Gateway"
}

variable "api_gateway_execution_arn" {
  type = string
  description = "The execution ARN of API Gateway"
}

variable "api_gateway_root_resource_id" {
  type = string
  description = "The root resource ID of API Gateway"
}

variable "api_gateway_arn" {
  type = string
  description = "The ARN of API Gateway"
}

variable "node_layer_arn" {
  type = string
  description = "The ARN of the Lambda Layer"
}

variable "dynamo_arn"{
  type = string
  description = "The ARN of the DynamoDB table"
}

variable "aws_acm_certificate_validation_certificate_arn" {
  type = string
  description = "The ACM certificate validation for the API Route 53 record"
}