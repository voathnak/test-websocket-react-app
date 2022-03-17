resource "aws_api_gateway_integration" "api_integration" {
  http_method             = aws_api_gateway_method.method.http_method
  resource_id             = aws_api_gateway_resource.api_resource.id
  rest_api_id             = var.rest_api.id
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.function.invoke_arn
}
