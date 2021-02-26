output "identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}

output "user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.main.arn
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "api_gateway_root_resource_id" {
  value = aws_api_gateway_rest_api.main.root_resource_id
  description = "The root resource ID of API Gateway"
}

output "api_gateway_id" {
  value = aws_api_gateway_rest_api.main.id
  description = "The ID of API Gateway"
}

output "api_gateway_execution_arn" {
  value = aws_api_gateway_rest_api.main.execution_arn
  description = "The execution ARN of API Gateway"
}

output "api_gateway_arn" {
  value = aws_api_gateway_rest_api.main.arn
  description = "The ARN of API Gateway"
}

output "api_gateway_endpoint" {
  value = aws_cognito_user_pool.main.endpoint
  description = "The HTTP endpoint for the REST API"
}