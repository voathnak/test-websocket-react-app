resource "aws_api_gateway_method" "method" {
  authorization = var.authorization
  http_method   = var.http_method
  resource_id   = aws_api_gateway_resource.api_resource.id
  rest_api_id   = var.rest_api.id
}

resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = var.rest_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}