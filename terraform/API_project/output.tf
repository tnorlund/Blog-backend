output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.get_project ), 
    jsonencode( aws_api_gateway_integration.post_project ), 
    jsonencode( aws_api_gateway_integration.delete_project ), 
    jsonencode( aws_api_gateway_integration.get_project_details ), 
    jsonencode( aws_api_gateway_integration.post_project_update ), 
    jsonencode( aws_api_gateway_integration.post_project_follow ), 
    jsonencode( aws_api_gateway_integration.delete_project_follow ), 
  )
}

output "methods" {
  value = [
    aws_api_gateway_method.get_project,
    aws_api_gateway_method.post_project,
    aws_api_gateway_method.delete_project,
    aws_api_gateway_method.get_project_details,
    aws_api_gateway_method.post_project_update,
    aws_api_gateway_method.post_project_follow,
    aws_api_gateway_method.delete_project_follow,
  ]
}