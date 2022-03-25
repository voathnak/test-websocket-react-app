
output "webSocketUrl" {
  description = "webSocketApi"

  value = "https://${aws_apigatewayv2_api.socket_api_gateway.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_apigatewayv2_stage.stage.name}"
}

output "webSocketApi" {
  description = "webSocketApi"

  value = "wss://${aws_apigatewayv2_api.socket_api_gateway.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_apigatewayv2_stage.stage.name}"
}
