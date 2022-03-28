output "method_id" {
  value = [for method in aws_api_gateway_method.method : method.id]
}


output "integration_id" {
  value = [for api_integration in aws_api_gateway_integration.api_integration : api_integration.id]
}

output "options_method_id" {
  value = aws_api_gateway_method.options_method.id
}

output "options_method_response_id" {
  value = aws_api_gateway_method_response.options_200.id
}

output "options_integration_id" {
  value = aws_api_gateway_integration.options_integration.id
}

output "api_resource" {
  value = aws_api_gateway_resource.api_resource
}

output "deployment_sha" {
  value = sha1(jsonencode([
    [for method in aws_api_gateway_method.method : method.id],
    [for asm in aws_api_gateway_method.api_resource_specific_method : asm.id],
    [for ai in aws_api_gateway_integration.api_integration : ai.id],
    [for ai in aws_api_gateway_integration.api_resource_specific_integration : ai.id],
    var.function.invoke_arn,
    aws_api_gateway_method.options_method.id,
    aws_api_gateway_method_response.options_200.id,
    aws_api_gateway_integration.options_integration.id,
    aws_api_gateway_resource.api_resource.id

  ]))
}