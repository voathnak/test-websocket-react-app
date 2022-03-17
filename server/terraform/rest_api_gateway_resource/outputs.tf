output "method_id" {
  value = aws_api_gateway_method.method.id
}

output "options_method_id" {
  value = aws_api_gateway_method.options_method.id
}

output "options_method_response_id" {
  value = aws_api_gateway_method_response.options_200.id
}

output "integration_id" {
  value = aws_api_gateway_integration.api_integration.id
}

output "options_integration_id" {
  value = aws_api_gateway_integration.options_integration.id
}

output "api_resource" {
  value = aws_api_gateway_resource.api_resource
}

output "deployment_sha" {
  value = sha1(jsonencode([
      aws_api_gateway_method.method.id,
      aws_api_gateway_method.options_method.id,
      aws_api_gateway_method_response.options_200.id,
      aws_api_gateway_integration.api_integration.id,
      aws_api_gateway_integration.options_integration.id,
      aws_api_gateway_resource.api_resource.id
  ]))
}