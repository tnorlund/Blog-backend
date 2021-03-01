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

/**
 * The Identity module handles the Cognito User Pools and Cognito Identity Pools
 * used. This assigns permissions to the users: REST and Kinesis.
 */
module "identity" {
  source             = "./Identity"
  developer          = "Tyler Norlund"
  bucket_name        = "tf-cloud"
  user_pool_name     = "blog_user_pool"
  identity_pool_name = "blog_identity_pool"
  stage              = var.stage
  firehose_arn       = module.analytics.firehose_arn
  api_name           = var.api_name
  domain             = var.domain
  dynamo_arn         = module.analytics.dynamo_arn
  table_name         = module.analytics.dynamo_table_name
  node_layer_arn     = module.node_layer.arn
}

/**
 * The API module handles the different methods used in the API. If any method
 * changes, it redeploys the stage.
 */
module "api" {
  source                       = "./API"
  developer                    = "Tyler Norlund"
  bucket_name                  = "tf-cloud"
  stage                        = var.stage
  api_gateway_id               = module.identity.api_gateway_id
  api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
  api_gateway_arn              = module.identity.api_gateway_arn
  api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
  table_name                   = module.analytics.dynamo_table_name
  dynamo_arn                   = module.analytics.dynamo_arn
  node_layer_arn               = module.node_layer.arn
  user_pool_arn                = module.identity.user_pool_arn
}

/**
 * The content delivery module created the CloudFront distribution and
 * redirects to it using Route 53.
 */
module "content_delivery" {
  source = "./ContentDelivery"
}

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
