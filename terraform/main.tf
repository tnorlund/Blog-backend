terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.28.0"
    }
  }
  required_version = "~> 0.14"

  backend "remote" {
    organization = "tnorlund"

    workspaces {
      name = "gh-actions-demo"
    }
  }
}

variable "ipify_key" {
  type        = string
  description = "The ipify key used to make REST queries"
}

variable "aws_region" {
  type        = string
  description = "The AWS region"
  default     = "us-east-1"
}

variable "stage" {
  type        = string
  description = "The stage of development"
  default     = "dev"
}

variable "api_name" {
  type    = string
  default = "blog_api"
}

variable "domain" {
  default = "tylernorlund.com"
}

/**
 * The AWS provider should be handled by ENV vars. 
 */
provider "aws" {
  region = var.aws_region
}

/**
 * The Python and NodeJS Lambda Layers should be uploaded to the bucket created
 * above.
 */
module "python_layer" {
  source      = "./LambdaLayer"
  type        = "python"
  developer   = "Tyler Norlund"
  bucket_name = "tf-cloud"
}
module "node_layer" {
  source      = "./LambdaLayer"
  type        = "nodejs"
  developer   = "Tyler Norlund"
  bucket_name = "tf-cloud"
}

/**
 * The Analytics module handles the Kinesis Firehose, DynamoDB, and the Lambda
 * Functions used with them.
 */
module "analytics" {
  source           = "./AnalyticsDynamo"
  developer        = "Tyler Norlund"
  bucket_name      = "tf-cloud"
  table_name       = "Blog"
  region           = var.aws_region
  node_layer_arn   = module.node_layer.arn
  python_layer_arn = module.python_layer.arn
  ipify_key        = var.ipify_key
}


# module "identity" {
#   source                      = "./Identity"
#   developer                   = "Tyler Norlund"
#   user_pool_name              = "blog_user_pool"
#   identity_pool_name          = "blog_identity_pool"
#   firehose_arn                = module.analytics.firehose_arn
#   api_name                    = var.api_name
#   domain                      = var.domain
#   custom_message_path         = "../code/lambda"
#   custom_message_file_name    = "custom_message"
#   post_confirmation_path      = "../code/lambda"
#   post_confirmation_file_name = "post_confirmation"
#   dynamo_arn                  = module.analytics.dynamo_arn
#   table_name                  = module.analytics.dynamo_table_name
#   node_layer_arn              = module.node_layer.arn
# }

# resource "aws_api_gateway_authorizer" "authorizer" {
#   name          = "CognitoUserPoolAuthorizer"
#   type          = "COGNITO_USER_POOLS"
#   rest_api_id   = module.identity.api_gateway_id
#   provider_arns = [
#     module.identity.user_pool_arn
#   ]
# }

# module "api_blog" {
#   source                       = "./API_blog"
#   get_path                     = "../code/lambda"
#   get_file_name                = "get_blog"
#   post_path                    = "../code/lambda"
#   post_file_name               = "post_blog"
#   method_name                  = "getBlog"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   developer                    = "Tyler Norlund"
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_project" {
#   source                        = "./API_project"
#   get_path                      = "../code/lambda"
#   get_file_name                 = "get_project"
#   get_details_path              = "../code/lambda"
#   get_details_file_name         = "get_project_details"
#   post_path                     = "../code/lambda"
#   post_file_name                = "post_project"
#   post_project_update_path      = "../code/lambda"
#   post_project_update_file_name = "post_project_update"
#   method_name                   = "getProject"
#   post_project_follow_path      = "../code/lambda"
#   post_project_follow_file_name = "post_project_follow"
#   delete_project_follow_path      = "../code/lambda"
#   delete_project_follow_file_name = "delete_project_follow"
#   delete_project_path           = "../code/lambda"
#   delete_project_file_name      = "delete_project"
#   developer                     = "Tyler Norlund"
#   api_gateway_id                = module.identity.api_gateway_id
#   api_gateway_execution_arn     = module.identity.api_gateway_execution_arn
#   api_gateway_arn               = module.identity.api_gateway_arn
#   api_gateway_root_resource_id  = module.identity.api_gateway_root_resource_id
#   table_name                    = module.analytics.dynamo_table_name
#   dynamo_arn                    = module.analytics.dynamo_arn
#   node_layer_arn                = module.node_layer.arn
# }

# module "api_comment" {
#   source                       = "./API_comment"
#   post_comment_path            = "../code/lambda"
#   post_comment_file_name       = "post_comment"
#   delete_comment_path            = "../code/lambda"
#   delete_comment_file_name       = "delete_comment"
#   post_reply_path              = "../code/lambda"
#   post_reply_file_name         = "post_reply"
#   post_vote_path               = "../code/lambda"
#   post_vote_file_name          = "post_vote"
#   delete_vote_path             = "../code/lambda"
#   delete_vote_file_name        = "delete_vote"
#   developer                    = "Tyler Norlund"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_post" {
#   source                       = "./API_Post"
#   post_post_path               = "../code/lambda"
#   post_post_file_name          = "post_post"
#   get_post_path                = "../code/lambda"
#   get_post_file_name           = "get_post"
#   delete_post_path             = "../code/lambda"
#   delete_post_file_name        = "delete_post"
#   get_post_details_path        = "../code/lambda"
#   get_post_details_file_name   = "get_post_details"
#   developer                    = "Tyler Norlund"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_tos" {
#   source                       = "./API_tos"
#   post_tos_path                = "../code/lambda"
#   post_tos_file_name           = "post_tos"
#   developer                    = "Tyler Norlund"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_user" {
#   source                       = "./API_user"
#   get_user_path                = "../code/lambda"
#   get_user_file_name           = "get_user"
#   get_user_details_path        = "../code/lambda"
#   get_user_details_file_name   = "get_user_details"
#   post_user_name_path          = "../code/lambda"
#   post_user_name_file_name     = "post_user_name"
#   post_disable_user_path       = "../code/lambda"
#   post_disable_user_file_name  = "post_disable_user"
#   developer                    = "Tyler Norlund"
#   authorizer_id                = aws_api_gateway_authorizer.authorizer.id
#   user_pool_id                 = module.identity.user_pool_id
#   user_pool_arn                = module.identity.user_pool_arn
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_deployment" {
#   source         = "./API_deploy"
#   api_gateway_id = module.identity.api_gateway_id
#   integrations   = concat(
#     module.api_blog.integrations,
#     module.api_project.integrations,
#     module.api_comment.integrations,
#     module.api_post.integrations,
#     module.api_tos.integrations,
#     module.api_user.integrations,
#   )
#   depends_on = [ module.api_comment.methods ]
# }

# module "cdn" {
#   source = "./Content Delivery"
#   domain = var.domain
# }

# output "GATSBY_API_BLOG_ENDPOINT" {
#   value = module.api_deployment.invoke_url
# }

# output "GATSBY_COGNITO_IDENTITY_POOL_ID" {
#   value = module.identity.identity_pool_id
# }

# output "GATSBY_USER_POOLS_ID" {
#   value = module.identity.user_pool_id
# }

# output "GATSBY_USER_POOLS_CLIENT_ID" {
#   value = module.identity.user_pool_client_id
# }

output "GATSBY_DYNAMO_TABLE" {
  value = module.analytics.dynamo_table_name
}

output "GATSBY_ANALYTICS_FIREHOSE" {
  value = module.analytics.firehose_stream_name
}

# output "GATSBY_AWS_REGION" {
#   value = var.aws_region
# }

# output "GATSBY_ANALYTICS_REGION" {
#   value = var.aws_region
# }

# output "GATSBY_API_BLOG_NAME" {
#   value = var.api_name
# }
