provider "aws" {
  shared_credentials_file = "~/.aws/credentials"
  profile                 = "development"
  region                  = "us-west-2"
}

module "layer" {
  source = "./LambdaLayer"
  type = "python"
  path = ".."
  developer = "Tyler Norlund"
}

# module "layer" {
#   source = "./LambdaLayer"
#   type = "nodejs"
#   path = "../node/layers/"
# }

# module "analytics" {
#   source = "./analytics"
#   kinesis_path = "${path.cwd}/../node/lambda/KinesisProcessor"
#   kinesis_file_name = "process"
#   dynamo_path = "${path.cwd}/../node/lambda/DynamoDBStream"
#   dynamo_file_name = "DynamoDBStream"
#   table_name = "Blog"
#   developer = "Tyler Norlund"
#   layer_arn = module.layer.arn
#   ipify_key = var.ipify_key
# }

# module "identity" {
#   source = "./Identity"
#   developer = "Tyler Norlund"
#   user_pool_name = "blog_user_pool"
#   identity_pool_name = "blog_identity_pool"
#   firehose_arn = module.analytics.firehose_arn
#   api_name = "blog-api"
# }

# output "identity_pool_id" {
#   value = module.identity.identity_pool_id
# }

variable "ipify_key" {
  type = string
  description = "The ipify key used to make REST queries"
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