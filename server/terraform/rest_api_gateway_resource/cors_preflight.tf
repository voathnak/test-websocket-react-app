resource "aws_api_gateway_integration_response" "options_integration_response" {
    rest_api_id = var.rest_api.id
    resource_id = aws_api_gateway_resource.api_resource.id
    http_method   = aws_api_gateway_method.options_method.http_method
    status_code   = aws_api_gateway_method_response.options_200.status_code
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
        "method.response.header.Access-Control-Allow-Origin" = "'*'"
    }
}

resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = var.rest_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
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
}