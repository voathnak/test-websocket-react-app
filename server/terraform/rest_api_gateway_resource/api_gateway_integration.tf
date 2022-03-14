resource "aws_api_gateway_integration" "api_integration" {
  http_method             = aws_api_gateway_method.method.http_method
  resource_id             = aws_api_gateway_resource.api_resource.id
  rest_api_id             = var.rest_api.id
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.function.invoke_arn
#  depends_on              = [aws_api_gateway_method.method, var.function]
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id          = var.rest_api.id
  resource_id          = aws_api_gateway_resource.api_resource.id
  http_method          = aws_api_gateway_method.options_method.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_MATCH"
  request_templates    = {
    "application/json" : "{\"statusCode\": 200}"
  }

#  depends_on = [aws_api_gateway_method.options_method]
}