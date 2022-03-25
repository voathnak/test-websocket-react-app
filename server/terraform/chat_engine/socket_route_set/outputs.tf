output "route_id" {
  description = "aws_apigatewayv2_route id"

  value = aws_apigatewayv2_route.route.id
}

output "route_integration_id" {
  description = "aws_apigatewayv2_integration id"

  value = aws_apigatewayv2_integration.route_integration.id
}
