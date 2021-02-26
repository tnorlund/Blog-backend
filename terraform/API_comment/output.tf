output "integrations" {
  value = list(
    jsonencode( aws_api_gateway_integration.post_comment ),
    jsonencode( aws_api_gateway_integration.delete_comment ), 
    jsonencode( aws_api_gateway_integration.post_reply ),
    jsonencode( aws_api_gateway_integration.post_vote ),
    jsonencode( aws_api_gateway_integration.delete_vote ),
  )
}

output "methods" {
  value = [
    aws_api_gateway_method.post_comment,
    aws_api_gateway_method.delete_comment,
    aws_api_gateway_method.post_reply,
    aws_api_gateway_method.post_vote,
    aws_api_gateway_method.delete_vote,
  ]
}