variable "developer" {
  type = string
  description = "The name of the developer making the change"
}

variable "domain" {
  type = string
  description = "The domain used to host the website"
}

# The development stage
variable "bucket_name" {
  type = string
  description = "The S3 bucket used to store the Lambda Functions"
}

variable "stage" {
  type = string
  default = "dev"
  description = "The stage of the REST API"
}

# The development stage
variable "user_pool_name" {
  type = string
  description = "The stage of the production."
}

# The development stage
variable "identity_pool_name" {
  type = string
  description = "The stage of the production."
}

variable "firehose_arn" {
  type = string
  description = "The ARN of the Kinesis Firehose stream"
}

variable "api_name" {
  type = string
  description = "The name of the API Gateway resource"
}

variable "node_layer_arn" {
  type = string
  description = "The ARN of the Lambda Layer"
}

variable "table_name" {
  type = string
  description = "The name of the DynamoDB table"
}

variable "dynamo_arn"{
  type = string
  description = "The ARN of the DynamoDB table"
}