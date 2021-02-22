output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.post_post ), 
    jsonencode( aws_api_gateway_integration.get_post ),
    jsonencode( aws_api_gateway_integration.get_post_details )
  )
}