variable "ipify_key" {
  type = string
  description = "The ipify key used to make REST queries"
}

variable "aws_region" {
  type = string
  description = "The AWS region"
  default = "us-west-2"
}

provider "aws" {
  shared_credentials_file = "~/.aws/credentials"
  profile                 = "development"
  region                  = var.aws_region
}

module "layer_bucket" {
  source = "./LambdaLayerBucket"
  developer = "Tyler Norlund"
}

module "python_layer" {
  source = "./LambdaLayer"
  type = "python"
  path = ".."
  bucket_name = module.layer_bucket.bucket_name
  developer = "Tyler Norlund"
}

module "node_layer" {
  source = "./LambdaLayer"
  type = "nodejs"
  path = ".."
  bucket_name = module.layer_bucket.bucket_name
  developer = "Tyler Norlund"
}

module "analytics" {
  source = "./analytics"
  kinesis_path = "../code/lambda/"
  kinesis_file_name = "kinesis_processor"
  dynamo_path = "../code/lambda/"
  dynamo_file_name = "dynamo_processor"
  s3_path = "../code/lambda"
  s3_file_name = "s3_processor"
  table_name = "Blog"
  developer = "Tyler Norlund"
  node_layer_arn = module.node_layer.arn
  python_layer_arn = module.python_layer.arn
  ipify_key = var.ipify_key
}

module "identity" {
  source = "./Identity"
  developer = "Tyler Norlund"
  user_pool_name = "blog_user_pool"
  identity_pool_name = "blog_identity_pool"
  firehose_arn = module.analytics.firehose_arn
  api_name = "blog-api"
  custom_message_path = "../code/lambda"
  custom_message_file_name = "custom_message"
  post_confirmation_path = "../code/lambda"
  post_confirmation_file_name = "post_confirmation"
  dynamo_arn = module.analytics.dynamo_arn
  table_name = module.analytics.dynamo_table_name
  node_layer_arn = module.node_layer.arn
}

module "api_blog" {
  source = "./API_blog"
  get_path = "../code/lambda"
  get_file_name = "get_blog"
  post_path = "../code/lambda"
  post_file_name = "post_blog"
  method_name = "getBlog"
  api_gateway_id = module.identity.api_gateway_id
  api_gateway_execution_arn = module.identity.api_gateway_execution_arn
  api_gateway_arn = module.identity.api_gateway_arn
  api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
  developer = "Tyler Norlund"
  table_name = module.analytics.dynamo_table_name
  dynamo_arn = module.analytics.dynamo_arn
  node_layer_arn = module.node_layer.arn
}

# module "getBlog" {
#   source = "./API_Get"
#   path = "../code/lambda"
#   file_name = "get_blog"
#   method_name = "getBlog"
#   method_path = "blog"
#   api_gateway_id = module.identity.api_gateway_id
#   api_gateway_execution_arn = module.identity.api_gateway_execution_arn
#   api_gateway_arn = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   developer = "Tyler Norlund"
#   table_name = module.analytics.dynamo_table_name
#   dynamo_arn = module.analytics.dynamo_arn
#   node_layer_arn = module.node_layer.arn
# }

# module "addBlog" {
#   source = "./API_Post"
#   path = "../code/lambda"
#   file_name = "add_blog"
#   method_name = "addBlog"
#   method_path = "blog"
#   api_gateway_id = module.identity.api_gateway_id
#   api_gateway_execution_arn = module.identity.api_gateway_execution_arn
#   api_gateway_arn = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   developer = "Tyler Norlund"
#   table_name = module.analytics.dynamo_table_name
#   dynamo_arn = module.analytics.dynamo_arn
#   node_layer_arn = module.node_layer.arn
# }

output "identity_pool_id" {
  value = module.identity.identity_pool_id
}

output "user_pool_id" {
  value = module.identity.user_pool_id
}

output "user_pool_client_id" {
  value = module.identity.user_pool_client_id
}

output "dynamo_table_name" {
  value = module.analytics.dynamo_table_name
}

output "firehose_stream_name" {
  value = module.analytics.firehose_stream_name
}

output "aws_region" {
  value = var.aws_region
}

# module "cognito" {
#   source = "./COGNITO"
#   execute_arn = module.blog-api.aws_api_gateway_rest_api.execution_arn
#   stage_name = "test"
#   firehose_arn = module.analytics.firehose_arn
#   depends_on = [ module.blog-api, module.analytics ]
# }

# module "blog-api" {
#   source = "./blog_api"
#   name = "blog_api"
#   contact_tag = "Tyler"
# }

# module "GET" {
#   source = "./REST"
#   method = "GET"
#   name = "getBlog"
#   file_name = "getBlog"
#   contact_tag = "Tyler"
#   path = "../node/lambda/REST/getBlog"
#   table_name = module.table.table_name
#   aws_api_gateway_rest_api = module.blog-api.aws_api_gateway_rest_api
#   aws_iam_role = module.blog-api.aws_iam_role
#   aws_lambda_layer_version = module.blog-api.aws_lambda_layer_version
#   depends_on = [ module.blog-api ]
# }

# module "deployment" {
#   source = "./API_DEPLOY"
#   stage_name = "test"
#   api_id = module.blog-api.api_id
#   domain_name = module.blog-api.domain_name
#   depends_on = [ module.GET, module.blog-api ]
# }