resource "aws_api_gateway_rest_api" "root_api" {
  name = "${var.project_name}-${terraform.workspace}-v${var.changes_version}-root-api"
}


resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.root_api.id

  triggers = {
    # NOTE: The configuration below will satisfy ordering considerations,
    #       but not pick up all future REST API changes. More advanced patterns
    #       are possible, such as using the filesha1() function against the
    #       Terraform configuration file(s) or removing the .id references to
    #       calculate a hash against whole resources. Be aware that using whole
    #       resources will show a difference after the initial implementation.
    #       It will stabilize to only change when resources change afterwards.
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.users_api_resource.id,
      aws_api_gateway_resource.users_signup_api_resource.id,
      module.get_users_method_integration.method_id,
      module.get_users_method_integration.integration_id,
      module.users_signup_method_integration.method_id,
      module.users_signup_method_integration.integration_id,
      module.users_login_method_integration.method_id,
      module.users_login_method_integration.integration_id,
      aws_api_gateway_gateway_response.default_4xx,
      aws_api_gateway_gateway_response.default_5xx,
      aws_api_gateway_gateway_response.missing_authentication_token,
      aws_api_gateway_gateway_response.unauthorized
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.root_api.id
  stage_name    = terraform.workspace
}