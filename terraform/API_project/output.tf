# output "aws_api_gateway_resource" {
#   value = aws_api_gateway_resource.project.path
# }

output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.post_project ), 
    jsonencode( aws_api_gateway_integration.get_project ), 
    jsonencode( aws_api_gateway_integration.get_project_details ), 
  )
}