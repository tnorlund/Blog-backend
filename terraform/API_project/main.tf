/**
 * The IAM Role Policy used in the REST API Lambda Functions.
 */
resource "aws_iam_role" "lambda_role" {
  name               = "api_project_${var.stage}"
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
 * The API Gateway resource for adding and removing a project.
 */
resource "aws_api_gateway_resource" "project" {
  path_part = "project"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_project" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.project.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "get_project" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.project.id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "get_project" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.project.id
  http_method             = aws_api_gateway_method.get_project.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_project.invoke_arn
}
resource "aws_lambda_permission" "get_project" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_project.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.get_project.http_method}${aws_api_gateway_resource.project.path}"
}
data "archive_file" "get_project" {
  type = "zip"
  source_file = "${var.get_path}/${var.get_file_name}.js"
  output_path = "${var.get_path}/${var.get_file_name}.zip"
}
resource "aws_lambda_function" "get_project" {
  filename         = "${var.get_path}/${var.get_file_name}.zip"
  function_name    = var.get_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.get_file_name}.handler"
  source_code_hash = filebase64sha256("${var.get_path}/${var.get_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "GET the project items for the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.get_project, 
  ]
}
resource "aws_api_gateway_method" "post_project" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.project.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_project" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.project.id
  http_method             = aws_api_gateway_method.post_project.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_project.invoke_arn
}
resource "aws_lambda_permission" "post_project" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_project.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_project.http_method}${aws_api_gateway_resource.project.path}"
}
data "archive_file" "post_project" {
  type = "zip"
  source_file = "${var.post_path}/${var.post_file_name}.js"
  output_path = "${var.post_path}/${var.post_file_name}.zip"
}
resource "aws_lambda_function" "post_project" {
  filename         = "${var.post_path}/${var.post_file_name}.zip"
  function_name    = var.post_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_path}/${var.post_file_name}.zip")
  layers           = [ var.node_layer_arn ]
  runtime          = "nodejs12.x"
  timeout          = 10
  description      = "POST the project items for the REST API"

  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name    = var.developer
  }
  depends_on = [
    data.archive_file.post_project, 
  ]
}
resource "aws_api_gateway_method" "delete_project" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.project.id
  http_method   = "DELETE"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "delete_project" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.project.id
  http_method             = aws_api_gateway_method.delete_project.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_project.invoke_arn
}
resource "aws_lambda_permission" "delete_project" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_project.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.delete_project.http_method}${aws_api_gateway_resource.project.path}"
}
data "archive_file" "delete_project" {
  type = "zip"
  source_file = "${var.delete_project_path}/${var.delete_project_file_name}.js"
  output_path = "${var.delete_project_path}/${var.delete_project_file_name}.zip"
}
resource "aws_lambda_function" "delete_project" {
  filename         = "${var.delete_project_path}/${var.delete_project_file_name}.zip"
  function_name    = var.delete_project_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.delete_project_file_name}.handler"
  source_code_hash = filebase64sha256("${var.delete_project_path}/${var.delete_project_file_name}.zip")
  layers           = [ var.node_layer_arn ]
  runtime          = "nodejs12.x"
  timeout          = 10
  description      = "DELETE the project and follows using the REST API"

  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name    = var.developer
  }
  depends_on = [
    data.archive_file.delete_project, 
  ]
}

/**
 * The API Gateway Resource used to get the project's details.
 */
resource "aws_api_gateway_resource" "project_details" {
  path_part = "project-details"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_project_details" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.project_details.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "get_project_details" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.project_details.id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "get_project_details" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.project_details.id
  http_method             = aws_api_gateway_method.get_project_details.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_project_details.invoke_arn
}
resource "aws_lambda_permission" "get_project_details" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_project_details.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.get_project_details.http_method}${aws_api_gateway_resource.project_details.path}"
}
data "archive_file" "get_project_details" {
  type = "zip"
  source_file = "${var.get_details_path}/${var.get_details_file_name}.js"
  output_path = "${var.get_details_path}/${var.get_details_file_name}.zip"
}
resource "aws_lambda_function" "get_project_details" {
  filename         = "${var.get_details_path}/${var.get_details_file_name}.zip"
  function_name    = var.get_details_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.get_details_file_name}.handler"
  source_code_hash = filebase64sha256("${var.get_details_path}/${var.get_details_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "GET the project details for the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.get_project_details, 
  ]
}

/**
 * The API Gateway resource used for updating a project's information.
 */
resource "aws_api_gateway_resource" "project_update" {
  path_part = "project-update"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_project_update" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.project_update.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "post_project_update" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.project_update.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_project_update" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.project_update.id
  http_method             = aws_api_gateway_method.post_project_update.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_project_update.invoke_arn
}
resource "aws_lambda_permission" "post_project_update" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_project_update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_project_update.http_method}${aws_api_gateway_resource.project_update.path}"
}
data "archive_file" "post_project_update" {
  type = "zip"
  source_file = "${var.post_project_update_path}/${var.post_project_update_file_name}.js"
  output_path = "${var.post_project_update_path}/${var.post_project_update_file_name}.zip"
}
resource "aws_lambda_function" "post_project_update" {
  filename         = "${var.post_project_update_path}/${var.post_project_update_file_name}.zip"
  function_name    = var.post_project_update_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_project_update_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_project_update_path}/${var.post_project_update_file_name}.zip")
  layers           = [ var.node_layer_arn ]
  runtime          = "nodejs12.x"
  timeout          = 10
  description      = "POST the updated project using the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name    = var.developer
  }
  depends_on = [
    data.archive_file.post_project_update, 
  ]
}

/**
 * The API Gateway resource used for following and unfollowing a project.
 */
resource "aws_api_gateway_resource" "project_follow" {
  path_part = "project-follow"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_project_follow" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.project_follow.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "post_project_follow" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.project_follow.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_project_follow" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.project_follow.id
  http_method             = aws_api_gateway_method.post_project_follow.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_project_follow.invoke_arn
}
resource "aws_lambda_permission" "post_project_follow" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_project_follow.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_project_follow.http_method}${aws_api_gateway_resource.project_follow.path}"
}
data "archive_file" "post_project_follow" {
  type = "zip"
  source_file = "${var.post_project_follow_path}/${var.post_project_follow_file_name}.js"
  output_path = "${var.post_project_follow_path}/${var.post_project_follow_file_name}.zip"
}
resource "aws_lambda_function" "post_project_follow" {
  filename         = "${var.post_project_follow_path}/${var.post_project_follow_file_name}.zip"
  function_name    = var.post_project_follow_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_project_follow_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_project_follow_path}/${var.post_project_follow_file_name}.zip")
  layers           = [ var.node_layer_arn ]
  runtime          = "nodejs12.x"
  timeout          = 10
  description      = "POST the updated project using the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name    = var.developer
  }
  depends_on = [
    data.archive_file.post_project_follow, 
  ]
}

resource "aws_api_gateway_method" "delete_project_follow" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.project_follow.id
  http_method   = "DELETE"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "delete_project_follow" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.project_follow.id
  http_method             = aws_api_gateway_method.delete_project_follow.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_project_follow.invoke_arn
}
resource "aws_lambda_permission" "delete_project_follow" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_project_follow.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.delete_project_follow.http_method}${aws_api_gateway_resource.project_follow.path}"
}
data "archive_file" "delete_project_follow" {
  type = "zip"
  source_file = "${var.delete_project_follow_path}/${var.delete_project_follow_file_name}.js"
  output_path = "${var.delete_project_follow_path}/${var.delete_project_follow_file_name}.zip"
}
resource "aws_lambda_function" "delete_project_follow" {
  filename         = "${var.delete_project_follow_path}/${var.delete_project_follow_file_name}.zip"
  function_name    = var.delete_project_follow_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.delete_project_follow_file_name}.handler"
  source_code_hash = filebase64sha256("${var.delete_project_follow_path}/${var.delete_project_follow_file_name}.zip")
  layers           = [ var.node_layer_arn ]
  runtime          = "nodejs12.x"
  timeout          = 10
  description      = "DELETE a project follow using the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name    = var.developer
  }
  depends_on = [
    data.archive_file.post_project_follow, 
  ]
}
