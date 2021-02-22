output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.get_user_details )
  )
}