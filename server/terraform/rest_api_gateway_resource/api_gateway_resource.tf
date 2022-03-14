resource "aws_api_gateway_resource" "api_resource" {
  parent_id   = var.parent_id
  path_part   = var.path_part
  rest_api_id = var.rest_api.id
}