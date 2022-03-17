
module "post_url_gateway_resource" {
  source = "../rest_api_gateway_resource"

  parent_id = var.rest_api.root_resource_id
  authorization = "NONE"
  http_method   = "POST"
  path_part   = "preSignUrl"
  rest_api   = var.rest_api
  function = aws_lambda_function.image_upload_url_lambda
}
