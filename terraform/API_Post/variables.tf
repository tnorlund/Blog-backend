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

variable "post_post_path" {
  type = string
  description = "The path to the POST post Lambda Function file"
}

variable "post_post_file_name" {
  type = string
  description = "The name of the file used in the POST post Lambda function"
}

variable "get_post_path" {
  type = string
  description = "The path to the GET post Lambda Function file"
}

variable "get_post_file_name" {
  type = string
  description = "The name of the file used in the GET post Lambda function"
}

variable "delete_post_path" {
  type = string
  description = "The path to the GET post Lambda Function file"
}

variable "delete_post_file_name" {
  type = string
  description = "The name of the file used in the GET post Lambda function"
}

variable "get_post_details_path" {
  type = string
  description = "The path to the GET post Lambda Function file"
}

variable "get_post_details_file_name" {
  type = string
  description = "The name of the file used in the GET post Lambda function"
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
