locals {
  authorizer_lambda = {
    lambda_zip_path = "outputs/api-gateway-authorizer-lambda.zip"
    function_name   = format("%s-ver-%s-%s-%s", var.project_name, terraform.workspace, var.changes_version, "api_gateway_authorizer")
    handler         = "authenticate.user_login"
    runtime         = "python3.8"
  }
}

data "archive_file" "api-gateway-authorizer-lambda-archive" {
  type        = "zip"
  source_file = "../users/users_methods/authenticate.py"
  output_path = local.authorizer_lambda.lambda_zip_path
}

resource "aws_lambda_function" "authorizer" {
  filename      = local.authorizer_lambda.lambda_zip_path
  function_name = local.authorizer_lambda.function_name
  role          = aws_iam_role.lambda_assume_role.arn
  handler       = local.authorizer_lambda.handler
  runtime       = local.authorizer_lambda.runtime

  tags = {
    service       = var.project_name
    function_name = local.authorizer_lambda.function_name
  }

  #  source_code_hash = filebase64sha256(local.authorizer_lambda.lambda_zip_path)
}
