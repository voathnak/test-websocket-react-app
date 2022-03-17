resource "aws_api_gateway_resource" "api_resource" {
  parent_id   = var.parent_id
  path_part   = var.path_part
  rest_api_id = var.rest_api.id
}

resource "aws_api_gateway_resource" "api_resource_specific" {
  count =   var.resource_specific ? 1 : 0
  parent_id   = aws_api_gateway_resource.api_resource.id
  path_part   = "{id}"
  rest_api_id = var.rest_api.id
}