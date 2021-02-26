/**
 * The IAM Role Policy used in the REST API Lambda Functions.
 */
resource "aws_iam_role" "lambda_role" {
  name               = "api_comment_${var.stage}"
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
 * The API Gateway resource for the comment.
 */
resource "aws_api_gateway_resource" "comment" {
  path_part = "comment"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_comment" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.comment.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "post_comment" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.comment.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_comment" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.comment.id
  http_method             = aws_api_gateway_method.post_comment.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_comment.invoke_arn
}
resource "aws_lambda_permission" "post_comment" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_comment.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_comment.http_method}${aws_api_gateway_resource.comment.path}"
}
data "archive_file" "post_comment" {
  type = "zip"
  source_file = "${var.post_comment_path}/${var.post_comment_file_name}.js"
  output_path = "${var.post_comment_path}/${var.post_comment_file_name}.zip"
}
resource "aws_lambda_function" "post_comment" {
  filename         = "${var.post_comment_path}/${var.post_comment_file_name}.zip"
  function_name    = var.post_comment_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_comment_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_comment_path}/${var.post_comment_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "POST a comment through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.post_comment, 
  ]
}
resource "aws_api_gateway_method" "delete_comment" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.comment.id
  http_method   = "DELETE"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "delete_comment" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.comment.id
  http_method             = aws_api_gateway_method.delete_comment.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_comment.invoke_arn
}

resource "aws_lambda_permission" "delete_comment" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_comment.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.delete_comment.http_method}${aws_api_gateway_resource.comment.path}"
}
data "archive_file" "delete_comment" {
  type = "zip"
  source_file = "${var.delete_comment_path}/${var.delete_comment_file_name}.js"
  output_path = "${var.delete_comment_path}/${var.delete_comment_file_name}.zip"
}
resource "aws_lambda_function" "delete_comment" {
  filename         = "${var.delete_comment_path}/${var.delete_comment_file_name}.zip"
  function_name    = var.delete_comment_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.delete_comment_file_name}.handler"
  source_code_hash = filebase64sha256("${var.delete_comment_path}/${var.delete_comment_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "Delete a comment through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.delete_comment, 
  ]
}


/**
 * The API Gateway resource for the reply.
 */
resource "aws_api_gateway_resource" "reply" {
  path_part = "reply"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_reply" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.reply.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "post_reply" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.reply.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_reply" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.reply.id
  http_method             = aws_api_gateway_method.post_reply.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_reply.invoke_arn
}
resource "aws_lambda_permission" "post_reply" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_reply.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_reply.http_method}${aws_api_gateway_resource.reply.path}"
}
data "archive_file" "post_reply" {
  type = "zip"
  source_file = "${var.post_reply_path}/${var.post_reply_file_name}.js"
  output_path = "${var.post_reply_path}/${var.post_reply_file_name}.zip"
}
resource "aws_lambda_function" "post_reply" {
  filename         = "${var.post_reply_path}/${var.post_reply_file_name}.zip"
  function_name    = var.post_reply_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_reply_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_reply_path}/${var.post_reply_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "POST a comment reply through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.post_reply, 
  ]
}

resource "aws_api_gateway_resource" "vote" {
  path_part = "vote"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
module "cors_vote" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.1"

  api_id            = var.api_gateway_id
  api_resource_id   = aws_api_gateway_resource.vote.id
  allow_credentials = true
}
resource "aws_api_gateway_method" "post_vote" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.vote.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_vote" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.vote.id
  http_method             = aws_api_gateway_method.post_vote.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_vote.invoke_arn
}
resource "aws_lambda_permission" "post_vote" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_vote.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_vote.http_method}${aws_api_gateway_resource.vote.path}"
}
data "archive_file" "post_vote" {
  type = "zip"
  source_file = "${var.post_vote_path}/${var.post_vote_file_name}.js"
  output_path = "${var.post_vote_path}/${var.post_vote_file_name}.zip"
}
resource "aws_lambda_function" "post_vote" {
  filename         = "${var.post_vote_path}/${var.post_vote_file_name}.zip"
  function_name    = var.post_vote_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_vote_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_vote_path}/${var.post_vote_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "POST a comment vote through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.post_vote, 
  ]
}
resource "aws_api_gateway_method" "delete_vote" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.vote.id
  http_method   = "DELETE"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "delete_vote" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.vote.id
  http_method             = aws_api_gateway_method.delete_vote.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_vote.invoke_arn
}
resource "aws_lambda_permission" "delete_vote" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_vote.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.delete_vote.http_method}${aws_api_gateway_resource.vote.path}"
}
data "archive_file" "delete_vote" {
  type = "zip"
  source_file = "${var.delete_vote_path}/${var.delete_vote_file_name}.js"
  output_path = "${var.delete_vote_path}/${var.delete_vote_file_name}.zip"
}
resource "aws_lambda_function" "delete_vote" {
  filename         = "${var.delete_vote_path}/${var.delete_vote_file_name}.zip"
  function_name    = var.delete_vote_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.delete_vote_file_name}.handler"
  source_code_hash = filebase64sha256("${var.delete_vote_path}/${var.delete_vote_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "DELETE a comment vote through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.delete_vote, 
  ]
}
