resource "aws_api_gateway_integration" "api_integration" {
  for_each                = aws_api_gateway_method.method
  http_method             = each.value.http_method
  resource_id             = aws_api_gateway_resource.api_resource.id
  rest_api_id             = var.rest_api.id
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.function.invoke_arn
  #  depends_on              = [aws_api_gateway_method.method, var.function]
}

resource "aws_api_gateway_integration" "api_resource_specific_integration" {
  #  for_each = var.resource_specific ? var.resource_specific_http_methods : []
  count = var.resource_specific ? length(var.resource_specific_http_methods) : 0

  http_method             = var.resource_specific_http_methods[count.index]
  resource_id             = aws_api_gateway_resource.api_resource_specific[0].id
  rest_api_id             = var.rest_api.id
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.function.invoke_arn
  depends_on              = [aws_api_gateway_resource.api_resource_specific]
}
