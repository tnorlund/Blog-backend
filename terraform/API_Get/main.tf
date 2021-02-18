resource "aws_api_gateway_resource" "blog" {
  path_part   = var.method_path
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}

resource "aws_api_gateway_method" "blog" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.blog.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "blog" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.blog.id
  http_method             = aws_api_gateway_method.blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.getBlog.invoke_arn
}

resource "aws_api_gateway_deployment" "blog" {
  rest_api_id = var.api_gateway_id
  stage_name  = "prod"
  triggers = {
    redeployment = sha1(
      join( 
        ",", 
        list( jsonencode( aws_api_gateway_integration.blog ), )
      )
    )
  }
}

resource "aws_api_gateway_documentation_part" "blog" {
  location {
    type = "METHOD"
    method = aws_api_gateway_integration.blog.http_method
    path = "/${aws_api_gateway_resource.blog.path_part}"
  }
  properties = "{\"description\":\"Gets the blog details.\"}"
  rest_api_id = var.api_gateway_id
}

resource "aws_api_gateway_model" "blog" {
  rest_api_id  = var.api_gateway_id
  name         = var.method_name
  description  = "a JSON schema"
  content_type = "application/json"

  schema = <<EOF
{
  "type": "object"
}
EOF
}

resource "aws_lambda_permission" "blog" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getBlog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.blog.http_method}${aws_api_gateway_resource.blog.path}"
}

data "archive_file" "getBlog" {
  type = "zip"
  source_file = "${var.path}/${var.file_name}.js"
  output_path = "${var.path}/${var.file_name}.zip"
}
resource "aws_iam_role" "lambda_role" {
  name               = var.method_name
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
resource "aws_lambda_function" "getBlog" {
  filename      = "${var.path}/${var.file_name}.zip"
  function_name = var.file_name
  role          = aws_iam_role.lambda_role.arn
  handler       = "${var.file_name}.handler"
  source_code_hash = filebase64sha256("${var.path}/${var.file_name}.zip")
  runtime = "nodejs12.x"
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  timeout = 10

  tags = {
    Name    = var.developer
  }

  layers            = [ var.node_layer_arn ]

  depends_on = [
    data.archive_file.getBlog, 
    aws_cloudwatch_log_group.getBlog
  ]
}


resource "aws_cloudwatch_log_group" "getBlog" {
  name              = "/aws/lambda/${var.method_name}"
  retention_in_days = 14
}