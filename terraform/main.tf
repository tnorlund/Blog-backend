variable "ipify_key" {
  type        = string
  description = "The ipify key used to make REST queries"
}

variable "aws_region" {
  type        = string
  description = "The AWS region"
  default     = "us-west-2"
}

variable "api_name" {
  type    = string
  default = "blog_api"
}

provider "aws" {
  shared_credentials_file = "~/.aws/credentials"
  profile                 = "development"
  region                  = var.aws_region
}

module "layer_bucket" {
  source    = "./LambdaLayerBucket"
  developer = "Tyler Norlund"
}

module "python_layer" {
  source      = "./LambdaLayer"
  type        = "python"
  path        = ".."
  bucket_name = module.layer_bucket.bucket_name
  developer   = "Tyler Norlund"
}

module "node_layer" {
  source      = "./LambdaLayer"
  type        = "nodejs"
  path        = ".."
  bucket_name = module.layer_bucket.bucket_name
  developer   = "Tyler Norlund"
}

module "analytics" {
  source            = "./analytics"
  kinesis_path      = "../code/lambda/"
  kinesis_file_name = "kinesis_processor"
  dynamo_path       = "../code/lambda/"
  dynamo_file_name  = "dynamo_processor"
  s3_path           = "../code/lambda"
  s3_file_name      = "s3_processor"
  table_name        = "Blog"
  developer         = "Tyler Norlund"
  node_layer_arn    = module.node_layer.arn
  python_layer_arn  = module.python_layer.arn
  ipify_key         = var.ipify_key
}

module "identity" {
  source                      = "./Identity"
  developer                   = "Tyler Norlund"
  user_pool_name              = "blog_user_pool"
  identity_pool_name          = "blog_identity_pool"
  firehose_arn                = module.analytics.firehose_arn
  api_name                    = var.api_name
  custom_message_path         = "../code/lambda"
  custom_message_file_name    = "custom_message"
  post_confirmation_path      = "../code/lambda"
  post_confirmation_file_name = "post_confirmation"
  dynamo_arn                  = module.analytics.dynamo_arn
  table_name                  = module.analytics.dynamo_table_name
  node_layer_arn              = module.node_layer.arn
}

module "api_blog" {
  source                       = "./API_blog"
  get_path                     = "../code/lambda"
  get_file_name                = "get_blog"
  post_path                    = "../code/lambda"
  post_file_name               = "post_blog"
  method_name                  = "getBlog"
  api_gateway_id               = module.identity.api_gateway_id
  api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
  api_gateway_arn              = module.identity.api_gateway_arn
  api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
  developer                    = "Tyler Norlund"
  table_name                   = module.analytics.dynamo_table_name
  dynamo_arn                   = module.analytics.dynamo_arn
  node_layer_arn               = module.node_layer.arn
}

output "GATSBY_API_BLOG_ENDPOINT" {
  value = module.identity.api_gateway_endpoint
}

output "GATSBY_COGNITO_IDENTITY_POOL_ID" {
  value = module.identity.identity_pool_id
}

output "GATSBY_USER_POOLS_ID" {
  value = module.identity.user_pool_id
}

output "GATSBY_USER_POOLS_CLIENT_ID" {
  value = module.identity.user_pool_client_id
}

output "GATSBY_DYNAMO_TABLE" {
  value = module.analytics.dynamo_table_name
}

output "GATSBY_ANALYTICS_FIREHOSE" {
  value = module.analytics.firehose_stream_name
}

output "GATSBY_AWS_REGION" {
  value = var.aws_region
}

output "GATSBY_ANALYTICS_REGION" {
  value = var.aws_region
}

output "GATSBY_API_BLOG_NAME" {
  value = var.api_name
}
