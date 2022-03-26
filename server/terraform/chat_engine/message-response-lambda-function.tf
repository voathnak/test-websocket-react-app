locals {
  message_response_lambda = {
    lambda_zip_path = "outputs/message-response-lambda.zip"
    function_name   = format("%s-%s-ver-%s-%s", var.project_name, terraform.workspace, var.changes_version, "message_response")
    handler         = "message_response.handler"
    runtime         = "python3.9"
  }
}

data "archive_file" "message-response-lambda-archive" {
  type        = "zip"
  source_file = "../pysendmessage/message_response.py"
  output_path = local.message_response_lambda.lambda_zip_path
}

resource "aws_lambda_function" "message_response_lambda" {
  filename      = local.message_response_lambda.lambda_zip_path
  function_name = local.message_response_lambda.function_name
  role          = aws_iam_role.message_response_lambda_assume_role.arn
  handler       = local.message_response_lambda.handler
  timeout       = 90

  tags = {
    service       = var.service_name
    function_name = local.message_response_lambda.function_name
  }

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  source_code_hash = filebase64sha256(local.message_response_lambda.lambda_zip_path)

  runtime = local.message_response_lambda.runtime
  layers  = [var.core_lib_layer_arn, var.python_libs_layer_arn]

  environment {
    variables = {
      SECRET_KEY              = var.SECRET_KEY
      USER_MESSAGE_TABLE_NAME = var.message_dynamodb_table.name
      CONNECTION_TABLE_NAME   = var.socket_connection_dynamodb_table.name
      SOCKET_URL              = "https://${aws_apigatewayv2_api.socket_api_gateway.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_apigatewayv2_stage.stage.name}"
      IS_USING_LOCAL_DYNAMODB = 0
      STAGE_NAME              = terraform.workspace
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudwatch_log_group" "message_response" {
    name = "/aws/lambda/${aws_lambda_function.message_response_lambda.function_name}"

  retention_in_days = 30
}

resource "aws_lambda_event_source_mapping" "message_db_source_mapping" {
  event_source_arn       = var.message_dynamodb_table.stream_arn
  function_name          = aws_lambda_function.message_response_lambda.arn
  starting_position      = "LATEST"
  maximum_retry_attempts = 2
}