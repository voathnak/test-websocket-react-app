resource "aws_api_gateway_method" "method" {
  for_each = toset(var.http_methods)

  authorization = var.authorization
  http_method   = each.key
  resource_id   = aws_api_gateway_resource.api_resource.id
  rest_api_id   = var.rest_api.id
}

resource "aws_api_gateway_method" "api_resource_specific_method" {
  count         = var.resource_specific ? length(var.resource_specific_http_methods) : 0

  authorization = var.authorization
  http_method   = var.resource_specific_http_methods[count.index]
  resource_id   = aws_api_gateway_resource.api_resource_specific[0].id
  rest_api_id   = var.rest_api.id
  depends_on    = [aws_api_gateway_resource.api_resource_specific]
}
