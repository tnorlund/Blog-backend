/**
 * Require authorization for specific API paths
 */
resource "aws_api_gateway_authorizer" "authorizer" {
  name          = "CognitoUserPoolAuthorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = var.api_gateway_id
  provider_arns = [ var.user_pool_arn ]
}

/**
 * The IAM role for the Lambda functions used in the REST API.
 */
resource "aws_iam_role" "lambda_role" {
  name               = "api_blog_${var.stage}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "apigateway.amazonaws.com",
          "lambda.amazonaws.com",
          "events.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
data "aws_iam_policy_document" "lambda_policy_doc" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:getItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:UpdateItem",
      "dynamodb:GetRecords", 
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "logs:CreateLogStream"
    ]
    resources = [ 
      var.dynamo_arn,
      "${var.dynamo_arn}/*",
      "arn:aws:logs:*:*:*"
    ]
    sid = "codecommitid"
  }
}
resource "aws_iam_role_policy" "lambda_policy" {
  policy = data.aws_iam_policy_document.lambda_policy_doc.json
  role   = aws_iam_role.lambda_role.id
}

/**
 * The IAM role for the Lambda functions used in the REST API.
 */
resource "aws_iam_role" "lambda_role_cognito" {
  name               = "api_blog_cognito_${var.stage}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "apigateway.amazonaws.com",
          "lambda.amazonaws.com",
          "events.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
data "aws_iam_policy_document" "lambda_policy_doc_cognito" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:getItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:UpdateItem",
      "dynamodb:GetRecords", 
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:adminUserGlobalSignOut",
      "cognito-idp:adminDisableUser",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "logs:CreateLogStream"
    ]
    resources = [ 
      var.dynamo_arn,
      "${var.dynamo_arn}/*",
      "arn:aws:logs:*:*:*",
      var.user_pool_arn,
    ]
    sid = "codecommitid"
  }
}
resource "aws_iam_role_policy" "lambda_policy_cognito" {
  policy = data.aws_iam_policy_document.lambda_policy_doc_cognito.json
  role   = aws_iam_role.lambda_role_cognito.id
}

/******************************************************************************
 * /blog
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "blog" {
  path_part = "blog"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_blog" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.blog.id
  allow_credentials = true
}
/**
 * The blog should be accessible with a GET method. This is accessible by both
 * visitors and users.
 */
module "get_blog" {
  source                    = "./GET"
  function_name             = "get_blog"
  description               = "A GET method for querying the blog item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.blog.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.blog.path
  node_layer_arn            = var.node_layer_arn
}
/**
 * The blog can be created using the POST method. This is only used when there
 * is no blog item.
 */
module "post_blog" {
  source                    = "./POST"
  function_name             = "post_blog"
  description               = "A POST method for creating a blog item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.blog.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.blog.path
  node_layer_arn            = var.node_layer_arn
}

/******************************************************************************
 * /user
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "user" {
  path_part   = "user"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_user" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.user.id
  allow_credentials = true
}
/**
 * The user can be queried using the GET method.
 */
module "get_user" {
  source                    = "./GET"
  function_name             = "get_user"
  description               = "A GET method for querying the user item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.user.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.user.path
  node_layer_arn            = var.node_layer_arn
}

/******************************************************************************
 * /user-details
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "user_details" {
  path_part = "user-details"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_user_details" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.user_details.id
  allow_credentials = true
}
/**
 * The user and their details can be queried using the GET method.
 */
module "get_user_details" {
  source                    = "./GET"
  function_name             = "get_user_details"
  description               = "A GET method for querying the user and their details"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.user_details.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.user_details.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /user-name
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "user_name" {
  path_part = "user-name"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_user_name" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.user_name.id
  allow_credentials = true
}
module "post_user_name" {
  source                    = "./POST"
  function_name             = "post_user_name"
  description               = "A POST method for creating a blog item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.user_name.id
  iam_role_arn              = aws_iam_role.lambda_role_cognito.arn
  resource_path             = aws_api_gateway_resource.user_name.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /disable-user
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "disable_user" {
  path_part = "disable-user"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_disable_user" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.disable_user.id
  allow_credentials = true
}
module "post_disable_user" {
  source                    = "./POST"
  function_name             = "post_disable_user"
  description               = "A POST method for creating a blog item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.disable_user.id
  iam_role_arn              = aws_iam_role.lambda_role_cognito.arn
  resource_path             = aws_api_gateway_resource.disable_user.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /tos
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "tos" {
  path_part = "tos"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_tos" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.tos.id
  allow_credentials = true
}
module "post_tos" {
  source                    = "./POST"
  function_name             = "post_tos"
  description               = "A POST method for creating a tos item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.tos.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.tos.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /project
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "project" {
  path_part   = "project"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_project" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.project.id
  allow_credentials = true
}
module "get_project" {
  source                    = "./GET"
  function_name             = "get_project"
  description               = "A GET method for querying the project item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.project.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.project.path
  node_layer_arn            = var.node_layer_arn
}
module "post_project" {
  source                    = "./POST"
  function_name             = "post_project"
  description               = "A POST method for creating a blog item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.project.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.project.path
  node_layer_arn            = var.node_layer_arn
}
module "delete_project" {
  source                    = "./DELETE"
  function_name             = "delete_project"
  description               = "A DELETE method for removing a project item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.project.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.project.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /post
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "post" {
  path_part   = "post"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_post" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.post.id
  allow_credentials = true
}
module "post_post" {
  source                    = "./POST"
  function_name             = "post_post"
  description               = "A POST method for creating a blog item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.post.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.post.path
  node_layer_arn            = var.node_layer_arn
}
module "get_post" {
  source                    = "./GET"
  function_name             = "get_post"
  description               = "A GET method for querying the post item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.post.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.post.path
  node_layer_arn            = var.node_layer_arn
}
module "delete_post" {
  source                    = "./DELETE"
  function_name             = "delete_post"
  description               = "A DELETE method for removing a post item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.post.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.post.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /post-details
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "post_details" {
  path_part   = "post-details"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_post_details" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.post_details.id
  allow_credentials = true
}
module "get_post_details" {
  source                    = "./GET"
  function_name             = "get_post_details"
  description               = "A GET method for querying the post and its details"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.post_details.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.post_details.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /comment
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "comment" {
  path_part   = "comment"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_comment" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.comment.id
  allow_credentials = true
}
module "post_comment" {
  source                    = "./POST"
  function_name             = "post_comment"
  description               = "A POST method for creating a comment item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.comment.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.comment.path
  node_layer_arn            = var.node_layer_arn
}
module "delete_comment" {
  source                    = "./DELETE"
  function_name             = "delete_comment"
  description               = "A DELETE method for removing a comment item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.comment.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.comment.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /reply
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "reply" {
  path_part   = "reply"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_reply" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.reply.id
  allow_credentials = true
}
module "post_reply" {
  source                    = "./POST"
  function_name             = "post_reply"
  description               = "A POST method for creating a reply-comment item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.reply.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.reply.path
  node_layer_arn            = var.node_layer_arn
}
/******************************************************************************
 * /vote
 *
 *****************************************************************************/
resource "aws_api_gateway_resource" "vote" {
  path_part   = "vote"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_vote" {
  source            = "squidfunk/api-gateway-enable-cors/aws"
  version           = "0.3.1"
  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.vote.id
  allow_credentials = true
}
module "post_vote" {
  source                    = "./POST"
  function_name             = "post_vote"
  description               = "A POST method for creating a vote item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.vote.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.vote.path
  node_layer_arn            = var.node_layer_arn
}
module "delete_vote" {
  source                    = "./DELETE"
  function_name             = "delete_vote"
  description               = "A DELETE method for removing a vote item"
  developer                 = var.developer
  bucket_name               = var.bucket_name
  table_name                = var.table_name
  api_gateway_id            = var.api_gateway_id
  api_gateway_execution_arn = var.api_gateway_execution_arn
  resource_id               = aws_api_gateway_resource.vote.id
  iam_role_arn              = aws_iam_role.lambda_role.arn
  resource_path             = aws_api_gateway_resource.vote.path
  node_layer_arn            = var.node_layer_arn
}

resource "aws_api_gateway_domain_name" "main" {
  certificate_arn = var.aws_acm_certificate_validation_certificate_arn
  domain_name     = "api.tylernorlund.com"
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = var.api_gateway_id
  stage_name    = var.stage
}

resource "aws_api_gateway_base_path_mapping" "main" {
  api_id      = var.api_gateway_id
  domain_name = aws_api_gateway_domain_name.main.domain_name
  stage_name  = aws_api_gateway_stage.main.stage_name
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = var.api_gateway_id
  stage_name  = var.stage
  triggers = {
    redeployment = sha1(
      join( 
        ",", 
        list(
          jsonencode( module.get_blog.integration ),
          jsonencode( module.post_blog.integration ),
          jsonencode( module.get_user.integration ), 
          jsonencode( module.get_user_details.integration ), 
          jsonencode( module.post_user_name.integration ), 
          jsonencode( module.post_disable_user.integration ), 
          jsonencode( module.get_project.integration ), 
          jsonencode( module.post_project.integration ), 
          jsonencode( module.post_post.integration ), 
          jsonencode( module.get_post.integration ), 
          jsonencode( module.delete_post.integration ), 
          jsonencode( module.get_post_details.integration ), 
          jsonencode( module.post_comment.integration ), 
          jsonencode( module.delete_comment.integration ), 
          jsonencode( module.post_reply.integration ), 
        )
      )
    )
  }
}
