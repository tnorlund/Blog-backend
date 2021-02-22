output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.post_tos )
  )
}