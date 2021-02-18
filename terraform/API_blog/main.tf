resource "aws_api_gateway_resource" "blog" {
  # path_part   = var.method_path
  path_part = "blog"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}

resource "aws_api_gateway_method" "get_blog" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.blog.id
  http_method   = "GET"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "get_blog" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.blog.id
  http_method             = aws_api_gateway_method.get_blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_blog.invoke_arn
}

resource "aws_api_gateway_method" "post_blog" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.blog.id
  http_method   = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "post_blog" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.blog.id
  http_method             = aws_api_gateway_method.post_blog.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_blog.invoke_arn
}

resource "aws_api_gateway_deployment" "blog" {
  rest_api_id = var.api_gateway_id
  stage_name  = "prod"
  triggers = {
    redeployment = sha1(
      join( 
        ",", 
        list( 
          jsonencode( aws_api_gateway_integration.post_blog ), 
          jsonencode( aws_api_gateway_integration.get_blog ), 

        )
      )
    )
  }
  depends_on = [
    aws_api_gateway_method.get_blog,
    aws_api_gateway_integration.get_blog,
    aws_api_gateway_method.post_blog,
    aws_api_gateway_integration.post_blog,
  ]
}

resource "aws_api_gateway_documentation_part" "blog" {
  location {
    type = "METHOD"
    method = aws_api_gateway_integration.get_blog.http_method
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


resource "aws_iam_role" "lambda_role" {
  name               = "api_blog_${var.stage}"
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

resource "aws_lambda_permission" "get_blog" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_blog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.get_blog.http_method}${aws_api_gateway_resource.blog.path}"
}
data "archive_file" "get_blog" {
  type = "zip"
  source_file = "${var.get_path}/${var.get_file_name}.js"
  output_path = "${var.get_path}/${var.get_file_name}.zip"
}
resource "aws_lambda_function" "get_blog" {
  filename         = "${var.get_path}/${var.get_file_name}.zip"
  function_name    = var.get_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.get_file_name}.handler"
  source_code_hash = filebase64sha256("${var.get_path}/${var.get_file_name}.zip")
  runtime          = "nodejs12.x"
  timeout          = 10
  layers           = [ var.node_layer_arn ]
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name = var.developer
  }
  depends_on = [
    data.archive_file.get_blog, 
    # aws_cloudwatch_log_group.get_blog
  ]
}
# resource "aws_cloudwatch_log_group" "get_blog" {
#   name              = "/aws/lambda/get_blog"
#   retention_in_days = 14
# }

resource "aws_lambda_permission" "post_blog" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_blog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/${aws_api_gateway_method.post_blog.http_method}${aws_api_gateway_resource.blog.path}"
}
data "archive_file" "post_blog" {
  type = "zip"
  source_file = "${var.post_path}/${var.post_file_name}.js"
  output_path = "${var.post_path}/${var.post_file_name}.zip"
}
resource "aws_lambda_function" "post_blog" {
  filename         = "${var.post_path}/${var.post_file_name}.zip"
  function_name    = var.post_file_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.post_file_name}.handler"
  source_code_hash = filebase64sha256("${var.post_path}/${var.post_file_name}.zip")
  layers           = [ var.node_layer_arn ]
  runtime          = "nodejs12.x"
  timeout          = 10
  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
  tags = {
    Name    = var.developer
  }
  depends_on = [
    data.archive_file.post_blog, 
    # aws_cloudwatch_log_group.post_blog
  ]
}

# resource "aws_cloudwatch_log_group" "post_blog" {
#   name              = "/aws/lambda/post_blog"
#   retention_in_days = 14
# }