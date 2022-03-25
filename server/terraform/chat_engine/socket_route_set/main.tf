resource "aws_apigatewayv2_route" "route" {
  api_id             = var.socket_api.id
  route_key          = var.route_key
  authorization_type = "NONE"
  operation_name     = var.function_name
  target             = "integrations/${aws_apigatewayv2_integration.route_integration.id}"
}

resource "aws_apigatewayv2_integration" "route_integration" {
  api_id           = var.socket_api.id
  integration_type = "AWS_PROXY"

  connection_type      = "INTERNET"
  description          = "${var.route_key} integration"
  integration_uri      = aws_lambda_function.socket_route_lambda.invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"
}

