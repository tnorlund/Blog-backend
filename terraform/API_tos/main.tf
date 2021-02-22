resource "aws_api_gateway_resource" "tos" {
  path_part = "tos"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}

resource "aws_iam_role" "lambda_role" {
  name               = "api_tos_${var.stage}"
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

resource "aws_api_gateway_method" "post_tos" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.tos.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_tos" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.tos.id
  http_method             = aws_api_gateway_method.post_tos.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_tos.invoke_arn
}
resource "aws_lambda_permission" "post_tos" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_tos.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_tos.http_method}${aws_api_gateway_resource.tos.path}"
}
data "archive_file" "post_tos" {
  type = "zip"
  source_file = "${var.post_tos_path}/${var.post_tos_file_name}.js"
  output_path = "${var.post_tos_path}/${var.post_tos_file_name}.zip"
}
resource "aws_lambda_function" "post_tos" {
  filename         = "${var.post_tos_path}/${var.post_tos_file_name}.zip"
  function_name    = var.post_tos_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_tos_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_tos_path}/${var.post_tos_file_name}.zip")
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
    data.archive_file.post_tos, 
  ]
}
