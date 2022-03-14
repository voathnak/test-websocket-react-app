resource "aws_lambda_permission" "apigw_lambda_permission" {
  statement_id  = "${var.rest_api.name}Allow${replace(aws_api_gateway_resource.api_resource.path, "/", "-")}${var.http_method}Invoke"
  action        = "lambda:InvokeFunction"
  function_name = var.function.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${var.rest_api.execution_arn}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.api_resource.path}"
  #  source_arn = "arn:aws:execute-api:${var.aws_region}:${var.accountId}:${aws_api_gateway_rest_api.root_api.id}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.root_api_resource.path}"

}