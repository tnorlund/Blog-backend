output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.get_user ),
    jsonencode( aws_api_gateway_integration.get_user_details ),
    jsonencode( aws_api_gateway_integration.post_user_name ),
    jsonencode( aws_api_gateway_integration.post_disable_user ),
  )
}