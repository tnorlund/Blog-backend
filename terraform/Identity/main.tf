# Identity
#
#
#
# Both the API Gateway and SES require a certificate from Route 53.
resource "aws_ses_domain_identity" "identity" {
  domain = "tylernorlund.com"
}
data "aws_route53_zone" "blog" {
  name = "tylernorlund.com"
}

# Create the REST API
resource "aws_api_gateway_rest_api" "main" {
  name = var.api_name
}

# Cognito
resource "aws_cognito_user_pool" "main" {
  name = "${var.user_pool_name}_${var.stage}"
  username_attributes = [ "email" ]
  auto_verified_attributes = ["email"]
  schema {
    attribute_data_type = "String"
    mutable             = true
    name                = "name"
    required            = true
  }
  schema {
    attribute_data_type = "String"
    mutable             = true
    name                = "email"
    required            = true
  }

  password_policy {
    minimum_length    = "8"
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  mfa_configuration        = "OFF"

  lambda_config {
    custom_message    = aws_lambda_function.custom_message.arn
    post_confirmation = aws_lambda_function.post_confirmation.arn
  }
}

 resource "aws_cognito_user_pool_client" "client" {
    name                = "client"
    user_pool_id        = aws_cognito_user_pool.main.id
    generate_secret     = false
    explicit_auth_flows = ["ADMIN_NO_SRP_AUTH"]
 }

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.identity_pool_name}_${var.stage}"
  allow_unauthenticated_identities = true

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.client.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = true
  }
 }

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated   = aws_iam_role.auth.arn
    unauthenticated = aws_iam_role.unauth.arn
  }
}

resource "aws_cognito_user_group" "user" {
  name         = "user-group"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Users that have signed up and verified their emails"
  precedence   = 1
  role_arn     = aws_iam_role.user.arn
}

data "aws_iam_policy_document" "user_policy" {
  statement {
    effect="Allow"
    actions = [
      "firehose:ListDeliveryStreams",
      "firehose:PutRecord",
      "firehose:PutRecordBatch",
      "execute-api:Invoke",
      "execute-api:ManageConnections",
      "execute-api:InvalidateCache"
    ]
    resources = [
      var.firehose_arn,
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/GET/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/POST/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/DELETE/*"
    ]
    sid = "authCommitId"
  }
}
resource "aws_iam_role" "user" {
   name = "user_role"

   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      }
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "user" {
  policy = data.aws_iam_policy_document.user_policy.json
  role   = aws_iam_role.user.id
}

data "aws_iam_policy_document" "auth_policy" {
  statement {
    effect="Allow"
    actions = [
      "firehose:ListDeliveryStreams",
      "firehose:PutRecord",
      "firehose:PutRecordBatch",
      "execute-api:Invoke",
      "execute-api:ManageConnections",
      "execute-api:InvalidateCache"
    ]
    resources = [
      var.firehose_arn,
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/GET/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/POST/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/DELETE/*"
    ]
    sid = "authCommitId"
  }
}
resource "aws_iam_role" "auth" {
   name = "auth_role"

   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      }
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "auth" {
  policy = data.aws_iam_policy_document.auth_policy.json
  role   = aws_iam_role.auth.id
}

data "aws_iam_policy_document" "unauth_policy" {
  statement {
    effect="Allow"
    actions = [
      "firehose:ListDeliveryStreams",
      "firehose:PutRecord",
      "firehose:PutRecordBatch",
      "execute-api:Invoke",
      "execute-api:ManageConnections",
      "execute-api:InvalidateCache"
    ]
    resources = [
      var.firehose_arn,
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/GET/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/POST/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/DELETE/*"
    ]
    sid = "unauthCommitId"
  }
}
resource "aws_iam_role" "unauth" {
   name = "unauth_role"

   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      }
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "unauth" {
  policy = data.aws_iam_policy_document.unauth_policy.json
  role   = aws_iam_role.unauth.id
}


data "aws_iam_policy_document" "custom_message" {
  statement {
    effect="Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "logs:CreateLogStream",
      "logs:CreateLogGroup",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:*",
      var.dynamo_arn
    ]
    sid = "authCommitId"
  }
}
resource "aws_iam_role" "custom_message" {
   name = "custommessage"
   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "custom_message" {
  policy = data.aws_iam_policy_document.custom_message.json
  role   = aws_iam_role.custom_message.id
}
data "archive_file" "custom_message" {
  type = "zip"
  source_file = "${var.custom_message_path}/${var.custom_message_file_name}.js"
  output_path = "${var.custom_message_path}/${var.custom_message_file_name}.zip"
}
resource "aws_lambda_function" "custom_message" {
  filename         = "${var.custom_message_path}/${var.custom_message_file_name}.zip"
  function_name    = "${var.custom_message_file_name}_${var.stage}"
  role             = aws_iam_role.custom_message.arn
  handler          = "${var.custom_message_file_name}.handler"
  source_code_hash = filebase64sha256("${var.custom_message_path}/${var.custom_message_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "An Amazon Cognito Pool trigger that composes a unique message after a user signs up"

  environment {
    variables = {
      TABLE_NAME = var.table_name
      ENV = var.stage
      RESOURCENAME = "blogAuthCustomMessage"
      REGION = "us-west-2"
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.custom_message, 
  ]
}
resource "aws_lambda_permission" "custom_message" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.custom_message.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}

data "aws_iam_policy_document" "post_confirmation" {
  statement {
    effect="Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "logs:CreateLogStream",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "cognito-idp:AdminAddUserToGroup",
      "cognito-idp:GetGroup",
      "cognito-idp:CreateGroup"
    ]
    resources = [
      "arn:aws:logs:*",
      aws_cognito_user_pool.main.arn,
      var.dynamo_arn
    ]
    sid = "codecommitid"
  }
}
resource "aws_iam_role" "post_confirmation" {
   name = "post_confirmation_${var.stage}"
   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "post_confirmation" {
  policy = data.aws_iam_policy_document.post_confirmation.json
  role   = aws_iam_role.post_confirmation.id
}
data "archive_file" "post_confirmation" {
  type = "zip"
  source_file = "${var.post_confirmation_path}/${var.post_confirmation_file_name}.js"
  output_path = "${var.post_confirmation_path}/${var.post_confirmation_file_name}.zip"
}
resource "aws_lambda_function" "post_confirmation" {
  filename         = "${var.post_confirmation_path}/${var.post_confirmation_file_name}.zip"
  function_name    = "${var.post_confirmation_file_name}_${var.stage}"
  role             = aws_iam_role.post_confirmation.arn
  handler          = "${var.post_confirmation_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_confirmation_path}/${var.post_confirmation_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "An Amazon Cognito Pool trigger that adds a user to a User Pool and DynamoDB"
  environment {
    variables = {
      ENV = var.stage
      TABLE_NAME = var.table_name,
      GROUP = "User"
      REGION = "us-west-2"
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.post_confirmation, 
  ]
}
resource "aws_lambda_permission" "post_confirmation" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}