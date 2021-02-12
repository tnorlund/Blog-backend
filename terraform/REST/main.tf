resource "aws_api_gateway_resource" "blog" {
  path_part   = var.path
  parent_id   = var.aws_api_gateway_rest_api.root_resource_id
  rest_api_id = var.aws_api_gateway_rest_api.id
}

resource "aws_api_gateway_method" "blog" {
  rest_api_id   = var.aws_api_gateway_rest_api.id
  resource_id   = aws_api_gateway_resource.blog.id
  http_method   = var.method
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "blog" {
  rest_api_id             = var.aws_api_gateway_rest_api.id
  resource_id             = aws_api_gateway_resource.blog.id
  http_method             = aws_api_gateway_method.blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.getBlog.invoke_arn
}

resource "aws_api_gateway_deployment" "blog" {
  rest_api_id = var.aws_api_gateway_rest_api.id
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
  rest_api_id = var.aws_api_gateway_rest_api.id
}

resource "aws_api_gateway_model" "blog" {
  rest_api_id  = var.aws_api_gateway_rest_api.id
  name         = var.path
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
  source_arn    = "${var.aws_api_gateway_rest_api.execution_arn}/*/${aws_api_gateway_method.blog.http_method}${aws_api_gateway_resource.blog.path}"
}

data "archive_file" "getBlog" {
  type = "zip"
  source_file = "${var.file_name}.js"
  output_path = "${var.file_name}.zip"
}

resource "aws_lambda_function" "getBlog" {
  filename      = "${var.file_name}.zip"
  function_name = var.file_name
  role          = var.aws_iam_role.arn
  handler       = "${var.file_name}.handler"

  source_code_hash = filebase64sha256("${var.file_name}.zip")

  runtime = "nodejs12.x"

  environment {
    variables = {
      DEBUG      = "false",
      TABLE_NAME = var.table_name
    }
  }

  timeout = 10

  tags = {
    Name    = var.name
    Contact = var.contact_tag
  }

  layers = [ var.aws_lambda_layer_version.arn ]

  depends_on = [
    data.archive_file.getBlog, 
    aws_cloudwatch_log_group.getBlog
  ]
}

resource "aws_cloudwatch_log_group" "getBlog" {
  name              = "/aws/lambda/getBlog"
  retention_in_days = 14
}