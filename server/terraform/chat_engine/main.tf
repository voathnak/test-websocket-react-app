resource "aws_apigatewayv2_api" "socket_api_gateway" {
  name                       = format("%s-%s-%s", var.project_name, var.service_name, terraform.workspace)
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

#resource "aws_apigatewayv2_route" "connect_route" {
#  api_id    = aws_apigatewayv2_api.socket_api_gateway.id
#  route_key = "$connect"
#}

#module "routes" {
#  for_each = tomap({for route in var.route_set: route.name => route})
#
#  source  = "./socket_route_set"
#  route_key = each.value.key
#  core_lib_layer_arn         = var.core_lib_layer_arn
#  python_libs_layer_arn      = var.python_libs_layer_arn
#  image_processing_layer_arn = var.image_processing_layer_arn
#  route_lambda_lsf = each.value.source_file
#  socket_api = aws_apigatewayv2_api.socket_api_gateway
#  socket_connection_dynamodb_table = var.socket_connection_dynamodb_table
#  message_dynamodb_table = var.message_dynamodb_table
#  users_dynamodb_table = var.users_dynamodb_table
#  lambda_role_arn = aws_iam_role.lambda_role.arn
#  function_name = each.value.name
#}

#module "default_route" {
#  source  = "./socket_route_set"
#  api_id    = aws_apigatewayv2_api.socket_api_gateway.id
#  route_key = "$default"
#  core_lib_layer_arn         = var.core_lib_layer_arn
#  python_libs_layer_arn      = var.python_libs_layer_arn
#  image_processing_layer_arn = var.image_processing_layer_arn
#  route_lambda_lsf = ""
#  socket_api =aws_apigatewayv2_api.socket_api_gateway
#  socket_connection_dynamodb_table = var.socket_connection_dynamodb_table
#  message_dynamodb_table = var.message_dynamodb_table
#  users_dynamodb_table = var.users_dynamodb_table
#  lambda_role_arn = aws_iam_role.lambda_role.arn
#  function_name = "default_socket_route"
#}
module "connect_route" {
  source                           = "./socket_route_set"
  route_key                        = "$connect"
  core_lib_layer_arn               = var.core_lib_layer_arn
  python_libs_layer_arn            = var.python_libs_layer_arn
  image_processing_layer_arn       = var.image_processing_layer_arn
  route_lambda_lsf                 = "../onconnect/app.py"
  socket_api                       = aws_apigatewayv2_api.socket_api_gateway
  socket_connection_dynamodb_table = var.socket_connection_dynamodb_table
  message_dynamodb_table           = var.message_dynamodb_table
  users_dynamodb_table             = var.users_dynamodb_table
  lambda_role_arn                  = aws_iam_role.socket_lambda_role.arn
  function_name                    = "connect"
}
module "disconnect_route" {
  source                           = "./socket_route_set"
  route_key                        = "$disconnect"
  core_lib_layer_arn               = var.core_lib_layer_arn
  python_libs_layer_arn            = var.python_libs_layer_arn
  image_processing_layer_arn       = var.image_processing_layer_arn
  route_lambda_lsf                 = "../ondisconnect/app.py"
  socket_api                       = aws_apigatewayv2_api.socket_api_gateway
  socket_connection_dynamodb_table = var.socket_connection_dynamodb_table
  message_dynamodb_table           = var.message_dynamodb_table
  users_dynamodb_table             = var.users_dynamodb_table
  lambda_role_arn                  = aws_iam_role.socket_lambda_role.arn
  function_name                    = "disconnect"
}
module "configuration_route" {
  source                           = "./socket_route_set"
  route_key                        = "configuration"
  core_lib_layer_arn               = var.core_lib_layer_arn
  python_libs_layer_arn            = var.python_libs_layer_arn
  image_processing_layer_arn       = var.image_processing_layer_arn
  route_lambda_lsf                 = "../configuration/app.py"
  socket_api                       = aws_apigatewayv2_api.socket_api_gateway
  socket_connection_dynamodb_table = var.socket_connection_dynamodb_table
  message_dynamodb_table           = var.message_dynamodb_table
  users_dynamodb_table             = var.users_dynamodb_table
  lambda_role_arn                  = aws_iam_role.socket_lambda_role.arn
  function_name                    = "configuration"
}
module "sendmessage_route" {
  source                           = "./socket_route_set"
  route_key                        = "sendmessage"
  core_lib_layer_arn               = var.core_lib_layer_arn
  python_libs_layer_arn            = var.python_libs_layer_arn
  image_processing_layer_arn       = var.image_processing_layer_arn
  route_lambda_lsf                 = "../pysendmessage/app.py"
  socket_api                       = aws_apigatewayv2_api.socket_api_gateway
  socket_connection_dynamodb_table = var.socket_connection_dynamodb_table
  message_dynamodb_table           = var.message_dynamodb_table
  users_dynamodb_table             = var.users_dynamodb_table
  lambda_role_arn                  = aws_iam_role.socket_lambda_role.arn
  function_name                    = "sendmessage"
}

resource "aws_apigatewayv2_deployment" "socket_deployment" {
  api_id = aws_apigatewayv2_api.socket_api_gateway.id

  triggers = {
    # NOTE: The configuration below will satisfy ordering considerations,
    #       but not pick up all future REST API changes. More advanced patterns
    #       are possible, such as using the filesha1() function against the
    #       Terraform configuration file(s) or removing the .id references to
    #       calculate a hash against whole resources. Be aware that using whole
    #       resources will show a difference after the initial implementation.
    #       It will stabilize to only change when resources change afterwards.
    redeployment = sha1(jsonencode([
      module.connect_route.route_id,
      module.disconnect_route.route_id,
      module.configuration_route.route_id,
      module.sendmessage_route.route_id,
      module.connect_route.route_integration_id,
      module.disconnect_route.route_integration_id,
      module.configuration_route.route_integration_id,
      module.sendmessage_route.route_integration_id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_apigatewayv2_stage" "stage" {
  deployment_id          = aws_apigatewayv2_deployment.socket_deployment.id
  api_id                 = aws_apigatewayv2_api.socket_api_gateway.id
  name                   = terraform.workspace

  default_route_settings {
    throttling_rate_limit  = 10000
    throttling_burst_limit = 5000
    logging_level          = "ERROR"
  }
}