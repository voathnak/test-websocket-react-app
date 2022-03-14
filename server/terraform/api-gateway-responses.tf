

resource "aws_api_gateway_gateway_response" "unauthorized" {
  rest_api_id   = aws_api_gateway_rest_api.root_api.id
  status_code   = "401"
  response_type = "UNAUTHORIZED"

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_parameters = {
    "gatewayresponse.header.Authorization" = "'Basic'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'POST,GET,PUT,PATCH,DELETE,OPTIONS'",
    "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
  }
}

resource "aws_api_gateway_gateway_response" "default_4xx" {
   rest_api_id = aws_api_gateway_rest_api.root_api.id
   response_type = "DEFAULT_4XX"
   response_parameters = {
      "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
      "gatewayresponse.header.Access-Control-Allow-Methods" = "'POST,GET,PUT,PATCH,DELETE,OPTIONS'"
      "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
   }
   response_templates = {
      "application/json" = "{\"message\":$context.error.messageString}"
   }
}

resource "aws_api_gateway_gateway_response" "default_5xx" {
   rest_api_id = aws_api_gateway_rest_api.root_api.id
   response_type = "DEFAULT_5XX"
   response_parameters = {
      "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
      "gatewayresponse.header.Access-Control-Allow-Methods" = "'POST,GET,PUT,PATCH,DELETE,OPTIONS'"
      "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
   }
   response_templates = {
      "application/json" = "{\"message\": $context.error.messageString}"
   }
}

resource "aws_api_gateway_gateway_response" "missing_authentication_token" {
   rest_api_id = aws_api_gateway_rest_api.root_api.id
   response_type = "MISSING_AUTHENTICATION_TOKEN"
   status_code = "404"
   response_parameters = {
      "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
      "gatewayresponse.header.Access-Control-Allow-Methods" = "'POST,GET,PUT,PATCH,DELETE,OPTIONS'"
      "gatewayresponse.header.Access-Control-Allow-Origin" = "'*'"
   }
   response_templates = {
      "application/json" = "{\"message\": \"Resource not found\"}"
   }
}
