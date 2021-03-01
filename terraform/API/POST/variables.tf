variable "api_gateway_id" {
  type = string
  description = "The ID of API Gateway"
}

variable "api_gateway_execution_arn" {
  type = string
  description = "The execution ARN of API Gateway"
}

variable "developer" {
  type = string
  description = "The name of the developer making the change"
}

variable "node_layer_arn" {
  type = string
  description = "The ARN of the Lambda Layer"
}

variable "table_name" {
  type = string
  description = "The DynamoDB table name"
}

variable "description" {
  type = string
  description = "The Lambda Function's description"
  default = "A GET method used in API Gateway"
}

variable "bucket_name" {
  type = string
  description = "The name of the S3 bucket used to hold the uploaded code"
}

variable "function_name" {
  type = string
  description = "The name of the NodeJS function used in the Lambda Function"
}

variable "iam_role_arn" {
  type = string
  description = "The ARN of the IAM role used in the Lambda Function"
}

variable "resource_path" {
  type = string
  description = "The path used in the API method"
}

variable "resource_id" {
  type = string
  description = "The ID of the API Gateway resource"
}