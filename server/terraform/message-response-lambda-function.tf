locals {
  message_response_lambda = {
    lambda_zip_path = "outputs/message-response-lambda.zip"
    function_name = format("%s-v%s-%s-%s", var.project_name, var.changes_version, "message_response", terraform.workspace)
    handler = "message_response.handler"
    runtime = "python3.9"
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
  role          = aws_iam_role.full_access_dynamodb_lambda_role.arn
  handler       = local.message_response_lambda.handler
  timeout = 90

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  source_code_hash = filebase64sha256(local.message_response_lambda.lambda_zip_path)

  runtime = local.message_response_lambda.runtime
  layers = [aws_lambda_layer_version.core_lib_layer.arn, aws_lambda_layer_version.python_libs_layer.arn]

  environment {
    variables = {
      SECRET_KEY = var.SECRET_KEY
      USER_MESSAGE_TABLE_NAME = aws_dynamodb_table.message-dynamodb-table.name
      CONNECTION_TABLE_NAME = "vlim_ws_chatii_dev_i_conns_table"
      SOCKET_URL = "https://m4f2567sdd.execute-api.ap-southeast-1.amazonaws.com/dev-i-vi"
      IS_USING_LOCAL_DYNAMODB = 0
      STAGE_NAME = terraform.workspace
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudwatch_log_group" "message_response" {
#  name = "/aws/lambda/${aws_lambda_function.message_response_lambda.function_name}"

  retention_in_days = 30
}

resource "aws_lambda_event_source_mapping" "example" {
  event_source_arn  = aws_dynamodb_table.message-dynamodb-table.stream_arn
  function_name     = aws_lambda_function.message_response_lambda.arn
  starting_position = "LATEST"
  maximum_retry_attempts = 2
}