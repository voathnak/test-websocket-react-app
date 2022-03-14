resource "aws_api_gateway_method_response" "response_200" {
  resource_id = aws_api_gateway_resource.api_resource.id
  rest_api_id = var.rest_api.id
  http_method = aws_api_gateway_method.method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
#  depends_on  = [aws_api_gateway_method.method]
}

resource "aws_api_gateway_method_response" "options_200" {
  resource_id = aws_api_gateway_resource.api_resource.id
  rest_api_id = var.rest_api.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
#  depends_on  = [aws_api_gateway_method.options_method]
}
