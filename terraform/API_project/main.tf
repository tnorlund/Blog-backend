resource "aws_api_gateway_resource" "project" {
  path_part = "project"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
resource "aws_api_gateway_resource" "project_details" {
  path_part = "project-details"
  parent_id   = var.api_gateway_root_resource_id
  rest_api_id = var.api_gateway_id
}
# resource "aws_api_gateway_resource" "project_follow" {
#   path_part = "project-follow"
#   parent_id   = var.api_gateway_root_resource_id
#   rest_api_id = var.api_gateway_id
# }

# resource "aws_api_gateway_deployment" "project" {
#   rest_api_id = var.api_gateway_id
#   stage_name  = "prod"
#   triggers = {
#     redeployment = sha1(
#       join( 
#         ",", 
#         list( 
#           jsonencode( aws_api_gateway_integration.post_project ), 
#           jsonencode( aws_api_gateway_integration.get_project ), 
#           jsonencode( aws_api_gateway_integration.get_project_details ), 
#         )
#       )
#     )
#   }
#   depends_on = [
#     aws_api_gateway_method.get_project_details,
#     aws_api_gateway_integration.get_project_details,
#     aws_api_gateway_method.get_project,
#     aws_api_gateway_integration.get_project,
#     aws_api_gateway_method.post_project,
#     aws_api_gateway_integration.post_project,
#   ]
# }

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
      "arn:aws:logs:*" 
    ]
    sid = "codecommitid"
  }
}
resource "aws_iam_role_policy" "lambda_policy" {
  policy = data.aws_iam_policy_document.lambda_policy_doc.json
  role   = aws_iam_role.lambda_role.id
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
