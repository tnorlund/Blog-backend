resource "aws_api_gateway_method" "method" {
  rest_api_id   = var.api_gateway_id
  resource_id   = var.resource_id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = var.api_gateway_id
  resource_id             = var.resource_id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda_function.invoke_arn
}
resource "aws_lambda_permission" "permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.method.http_method}${var.resource_path}"
}
data "aws_s3_bucket_object" "object" {
  bucket = var.bucket_name
  key    = "${var.function_name}.zip"
}
resource "aws_lambda_function" "lambda_function" {
  s3_bucket        = var.bucket_name
  s3_key           = "${var.function_name}.zip"  
  function_name    = var.function_name
  role             = var.iam_role_arn
  handler          = "${var.function_name}.handler"
  source_code_hash = data.aws_s3_bucket_object.object.body
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  description      = var.description
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
}