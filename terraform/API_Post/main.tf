resource "aws_api_gateway_resource" "post" {
  path_part = "post"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
resource "aws_api_gateway_resource" "post_details" {
  path_part = "post-details"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}

resource "aws_api_gateway_method" "post_post" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.post.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_post" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.post.id
  http_method             = aws_api_gateway_method.post_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_post.invoke_arn
}
resource "aws_iam_role" "lambda_role" {
  name               = "api_post_${var.stage}"
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
      "arn:aws:logs:*" 
    ]
    sid = "codecommitid"
  }
}
resource "aws_iam_role_policy" "lambda_policy" {
  policy = data.aws_iam_policy_document.lambda_policy_doc.json
  role   = aws_iam_role.lambda_role.id
}


resource "aws_lambda_permission" "post_post" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_post.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_post.http_method}${aws_api_gateway_resource.post.path}"
}
data "archive_file" "post_post" {
  type = "zip"
  source_file = "${var.post_post_path}/${var.post_post_file_name}.js"
  output_path = "${var.post_post_path}/${var.post_post_file_name}.zip"
}
resource "aws_lambda_function" "post_post" {
  filename         = "${var.post_post_path}/${var.post_post_file_name}.zip"
  function_name    = var.post_post_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_post_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_post_path}/${var.post_post_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "POST a post through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.post_post, 
  ]
}


resource "aws_api_gateway_method" "get_post" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.post.id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "get_post" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.post.id
  http_method             = aws_api_gateway_method.get_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_post.invoke_arn
}
resource "aws_lambda_permission" "get_post" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_post.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.get_post.http_method}${aws_api_gateway_resource.post.path}"
}
data "archive_file" "get_post" {
  type = "zip"
  source_file = "${var.get_post_path}/${var.get_post_file_name}.js"
  output_path = "${var.get_post_path}/${var.get_post_file_name}.zip"
}
resource "aws_lambda_function" "get_post" {
  filename         = "${var.get_post_path}/${var.get_post_file_name}.zip"
  function_name    = var.get_post_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.get_post_file_name}.handler"
  source_code_hash = filebase64sha256("${var.get_post_path}/${var.get_post_file_name}.zip")
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
    data.archive_file.get_post, 
  ]
}


resource "aws_api_gateway_method" "get_post_details" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.post_details.id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "get_post_details" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.post_details.id
  http_method             = aws_api_gateway_method.get_post_details.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_post_details.invoke_arn
}
resource "aws_lambda_permission" "get_post_details" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_post_details.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.get_post_details.http_method}${aws_api_gateway_resource.post_details.path}"
}
data "archive_file" "get_post_details" {
  type = "zip"
  source_file = "${var.get_post_details_path}/${var.get_post_details_file_name}.js"
  output_path = "${var.get_post_details_path}/${var.get_post_details_file_name}.zip"
}
resource "aws_lambda_function" "get_post_details" {
  filename         = "${var.get_post_details_path}/${var.get_post_details_file_name}.zip"
  function_name    = var.get_post_details_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.get_post_details_file_name}.handler"
  source_code_hash = filebase64sha256("${var.get_post_details_path}/${var.get_post_details_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = "GET a post's details through the REST API"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.get_post_details, 
  ]
}