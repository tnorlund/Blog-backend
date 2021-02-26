/**
 * The IAM Role Policy used in the REST API Lambda Functions.
 */
resource "aws_iam_role" "lambda_role" {
  name               = "api_user_${var.stage}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
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
resource "aws_iam_role_policy" "lambda_policy" {
  policy = data.aws_iam_policy_document.lambda_policy_doc.json
  role   = aws_iam_role.lambda_role.id
}

/**
 * The API Gateway resource for the user.
 */
resource "aws_api_gateway_resource" "user" {
  path_part = "user"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_user" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.user.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "get_user" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "get_user" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.user.id
  http_method             = aws_api_gateway_method.get_user.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_user.invoke_arn
}
resource "aws_lambda_permission" "get_user" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.get_user.http_method}${aws_api_gateway_resource.user.path}"
}
data "archive_file" "get_user" {
  type = "zip"
  source_file = "${var.get_user_path}/${var.get_user_file_name}.js"
  output_path = "${var.get_user_path}/${var.get_user_file_name}.zip"
}
resource "aws_lambda_function" "get_user" {
  filename         = "${var.get_user_path}/${var.get_user_file_name}.zip"
  function_name    = var.get_user_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.get_user_file_name}.handler"
  source_code_hash = filebase64sha256("${var.get_user_path}/${var.get_user_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "GET the user details through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.get_user, 
  ]
}

/**
 * The API Gateway resource for the user details.
 */
resource "aws_api_gateway_resource" "user_details" {
  path_part = "user-details"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_user_details" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.user_details.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "get_user_details" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.user_details.id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "get_user_details" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.user_details.id
  http_method             = aws_api_gateway_method.get_user_details.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_user_details.invoke_arn
}
resource "aws_lambda_permission" "get_user_details" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user_details.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.get_user_details.http_method}${aws_api_gateway_resource.user_details.path}"
}
data "archive_file" "get_user_details" {
  type = "zip"
  source_file = "${var.get_user_details_path}/${var.get_user_details_file_name}.js"
  output_path = "${var.get_user_details_path}/${var.get_user_details_file_name}.zip"
}
resource "aws_lambda_function" "get_user_details" {
  filename         = "${var.get_user_details_path}/${var.get_user_details_file_name}.zip"
  function_name    = var.get_user_details_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.get_user_details_file_name}.handler"
  source_code_hash = filebase64sha256("${var.get_user_details_path}/${var.get_user_details_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "GET the user details through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.get_user_details, 
  ]
}

/**
 * The API Gateway resource for the user details.
 */
resource "aws_api_gateway_resource" "user_name" {
  path_part = "user-name"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_user_name" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.user_name.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "post_user_name" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.user_name.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_user_name" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.user_name.id
  http_method             = aws_api_gateway_method.post_user_name.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_user_name.invoke_arn
}
resource "aws_lambda_permission" "post_user_name" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_user_name.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_user_name.http_method}${aws_api_gateway_resource.user_name.path}"
}
data "archive_file" "post_user_name" {
  type = "zip"
  source_file = "${var.post_user_name_path}/${var.post_user_name_file_name}.js"
  output_path = "${var.post_user_name_path}/${var.post_user_name_file_name}.zip"
}
resource "aws_lambda_function" "post_user_name" {
  filename         = "${var.post_user_name_path}/${var.post_user_name_file_name}.zip"
  function_name    = var.post_user_name_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_user_name_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_user_name_path}/${var.post_user_name_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "GET the user details through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name,
      USERPOOLID = var.user_pool_id
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.post_user_name, 
  ]
}

/**
 * The API Gateway resource for disable user.
 */
resource "aws_api_gateway_resource" "disable_user" {
  path_part = "disable-user"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_disable_user" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.disable_user.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "post_disable_user" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.disable_user.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_disable_user" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.disable_user.id
  http_method             = aws_api_gateway_method.post_disable_user.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_disable_user.invoke_arn
}
resource "aws_lambda_permission" "post_disable_user" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_disable_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_disable_user.http_method}${aws_api_gateway_resource.disable_user.path}"
}
data "archive_file" "post_disable_user" {
  type = "zip"
  source_file = "${var.post_disable_user_path}/${var.post_disable_user_file_name}.js"
  output_path = "${var.post_disable_user_path}/${var.post_disable_user_file_name}.zip"
}
resource "aws_lambda_function" "post_disable_user" {
  filename         = "${var.post_disable_user_path}/${var.post_disable_user_file_name}.zip"
  function_name    = var.post_disable_user_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_disable_user_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_disable_user_path}/${var.post_disable_user_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "GET the user details through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name,
      USERPOOLID = var.user_pool_id
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.post_disable_user, 
  ]
}
