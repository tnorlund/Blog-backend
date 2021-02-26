variable "table_name" {
  type = string
  description = "The name of the DynamoDB table"
}

variable "developer" {
  type = string
  description = "The name of the developer making the change"
}

variable "stage" {
  type = string
  default = "dev"
  description = "The stage of the production."
}

variable "get_user_path" {
  type = string
  description = "The path to the file used in the GET Lambda Function"
}

variable "get_user_file_name" {
  type = string
  description = "The name of the file used in the GET Lambda function"
}

variable "get_user_details_path" {
  type = string
  description = "The path to the file used in the GET Lambda Function"
}

variable "get_user_details_file_name" {
  type = string
  description = "The name of the file used in the GET Lambda function"
}

variable "post_user_name_path" {
  type = string
  description = "The path to the file used in the GET Lambda Function"
}

variable "post_user_name_file_name" {
  type = string
  description = "The name of the file used in the GET Lambda function"
}

variable "user_pool_arn" {
  type = string
  description = "value"
}

variable "user_pool_id" {
  type = string
  description = "value"
}

variable "api_gateway_root_resource_id" {
  type = string
  description = "The root resource ID of API Gateway"
}

variable "api_gateway_id" {
  type = string
  description = "The ID of API Gateway"
}

variable "api_gateway_execution_arn" {
  type = string
  description = "The execution ARN of API Gateway"
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
