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

module "api_project" {
  source                        = "./API_project"
  get_path                      = "../code/lambda"
  get_file_name                 = "get_project"
  get_details_path              = "../code/lambda"
  get_details_file_name         = "get_project_details"
  post_path                     = "../code/lambda"
  post_file_name                = "post_project"
  post_project_update_path      = "../code/lambda"
  post_project_update_file_name = "post_project_update"
  method_name                   = "getProject"
  post_project_follow_path      = "../code/lambda"
  post_project_follow_file_name = "post_project_follow"
  delete_project_follow_path      = "../code/lambda"
  delete_project_follow_file_name = "delete_project_follow"
  delete_project_path           = "../code/lambda"
  delete_project_file_name      = "delete_project"
  developer                     = "Tyler Norlund"
  api_gateway_id                = module.identity.api_gateway_id
  api_gateway_execution_arn     = module.identity.api_gateway_execution_arn
  api_gateway_arn               = module.identity.api_gateway_arn
  api_gateway_root_resource_id  = module.identity.api_gateway_root_resource_id
  table_name                    = module.analytics.dynamo_table_name
  dynamo_arn                    = module.analytics.dynamo_arn
  node_layer_arn                = module.node_layer.arn
}

module "api_comment" {
  source                       = "./API_comment"
  post_comment_path            = "../code/lambda"
  post_comment_file_name       = "post_comment"
  delete_comment_path            = "../code/lambda"
  delete_comment_file_name       = "delete_comment"
  post_reply_path              = "../code/lambda"
  post_reply_file_name         = "post_reply"
  post_vote_path               = "../code/lambda"
  post_vote_file_name          = "post_vote"
  delete_vote_path             = "../code/lambda"
  delete_vote_file_name        = "delete_vote"
  developer                    = "Tyler Norlund"
  api_gateway_id               = module.identity.api_gateway_id
  api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
  api_gateway_arn              = module.identity.api_gateway_arn
  api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
  table_name                   = module.analytics.dynamo_table_name
  dynamo_arn                   = module.analytics.dynamo_arn
  node_layer_arn               = module.node_layer.arn
}

module "api_post" {
  source                       = "./API_post"
  post_post_path               = "../code/lambda"
  post_post_file_name          = "post_post"
  get_post_path                = "../code/lambda"
  get_post_file_name           = "get_post"
  delete_post_path                = "../code/lambda"
  delete_post_file_name           = "delete_post"
  get_post_details_path        = "../code/lambda"
  get_post_details_file_name   = "get_post_details"
  developer                    = "Tyler Norlund"
  api_gateway_id               = module.identity.api_gateway_id
  api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
  api_gateway_arn              = module.identity.api_gateway_arn
  api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
  table_name                   = module.analytics.dynamo_table_name
  dynamo_arn                   = module.analytics.dynamo_arn
  node_layer_arn               = module.node_layer.arn
}

module "api_tos" {
  source                       = "./API_tos"
  post_tos_path                = "../code/lambda"
  post_tos_file_name           = "post_tos"
  developer                    = "Tyler Norlund"
  api_gateway_id               = module.identity.api_gateway_id
  api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
  api_gateway_arn              = module.identity.api_gateway_arn
  api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
  table_name                   = module.analytics.dynamo_table_name
  dynamo_arn                   = module.analytics.dynamo_arn
  node_layer_arn               = module.node_layer.arn
}

module "api_user" {
  source                       = "./API_user"
  get_user_path                = "../code/lambda"
  get_user_file_name           = "get_user"
  get_user_details_path        = "../code/lambda"
  get_user_details_file_name   = "get_user_details"
  post_user_name_path          = "../code/lambda"
  post_user_name_file_name     = "post_user_name"
  developer                    = "Tyler Norlund"
  user_pool_id                 = module.identity.user_pool_id
  user_pool_arn                = module.identity.user_pool_arn
  api_gateway_id               = module.identity.api_gateway_id
  api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
  api_gateway_arn              = module.identity.api_gateway_arn
  api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
  table_name                   = module.analytics.dynamo_table_name
  dynamo_arn                   = module.analytics.dynamo_arn
  node_layer_arn               = module.node_layer.arn
}

module "api_deployment" {
  source         = "./API_deploy"
  api_gateway_id = module.identity.api_gateway_id
  integrations   = concat(
    module.api_blog.integrations,
    module.api_project.integrations,
    module.api_comment.integrations,
    module.api_post.integrations,
    module.api_tos.integrations,
    module.api_user.integrations,
  )
  depends_on = [ module.api_comment.methods ]
}

output "GATSBY_API_BLOG_ENDPOINT" {
  value = module.api_deployment.invoke_url
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
