resource "aws_api_gateway_integration_response" "options_integration_response" {
    rest_api_id = var.rest_api.id
    resource_id = aws_api_gateway_resource.api_resource.id
    http_method   = aws_api_gateway_method.options_method.http_method
    status_code   = aws_api_gateway_method_response.options_200.status_code
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
        "method.response.header.Access-Control-Allow-Origin" = "'*'"
    }
#    depends_on = [aws_api_gateway_method_response.options_200]
}