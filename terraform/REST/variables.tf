variable "aws_lambda_layer_version" {
  type = object( {
    arn = string
  } )
}

variable "aws_iam_role" {
  type = object( {
    arn = string
  } )
}

variable "aws_api_gateway_rest_api" {
  type = object( {
    id = string
    root_resource_id = string
    execution_arn = string
  } )
}

variable "path" {
  type = string
}

variable "table_name" {
  type = string
}

variable "name" {
  type = string
}

variable "contact_tag" {
  type = string
}

variable "file_name" {
  type = string
}

variable "method" {
  type = string
}