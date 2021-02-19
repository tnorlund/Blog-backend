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

variable "get_path" {
  type = string
  description = "The path to the file used in the GET Lambda Function"
}

variable "get_file_name" {
  type = string
  description = "The name of the file used in the GET Lambda function"
}

variable "post_path" {
  type = string
  description = "The path to the file used in the POST Lambda Function"
}

variable "post_file_name" {
  type = string
  description = "The name of the file used in the POST Lambda function"
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

variable "method_name"{
  type = string
  description = "The name of the API REST method"
}
