# output "aws_api_gateway_resource" {
#   value = aws_api_gateway_deployment.blog.invoke_url
# }

output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.post_blog ), 
    jsonencode( aws_api_gateway_integration.get_blog )
  )
}