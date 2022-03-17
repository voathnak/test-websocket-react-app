
module "get_users_gateway_resource" {
  source = "./rest_api_gateway_resource"

  parent_id = aws_api_gateway_rest_api.root_api.root_resource_id
  authorization = "NONE"
  http_methods   = ["GET", "POST", "PUT"]
  path_part   = "users"
  resource_specific   = true
  rest_api   = aws_api_gateway_rest_api.root_api
  function = aws_lambda_function.user
}

module "users_signup_gateway_resource" {
  source = "./rest_api_gateway_resource"

  parent_id = module.get_users_gateway_resource.api_resource.id
  authorization = "NONE"
  http_methods   = ["POST"]
  path_part   = "signup"
  rest_api   = aws_api_gateway_rest_api.root_api
  function = aws_lambda_function.user
}
module "users_login_gateway_resource" {
  source = "./rest_api_gateway_resource"

  parent_id = module.get_users_gateway_resource.api_resource.id
  authorization = "NONE"
  http_methods   = ["POST"]
  path_part   = "login"
  rest_api   = aws_api_gateway_rest_api.root_api
  function = aws_lambda_function.user
}