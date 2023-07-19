locals {
  socket_route_lambda = {
    lambda_zip_path = "outputs/socket-${var.function_name}-route-lambda.zip"
    function_name   = format("%s-%s-%s-%s-%s", var.project_name, var.service_name, terraform.workspace, "socket_route", var.function_name)
    handler         = "app.handler"
    runtime         = var.runtime
  }
}

data "archive_file" "socket-route-lambda-archive" {
  type        = "zip"
  source_file = var.route_lambda_lsf
  output_path = local.socket_route_lambda.lambda_zip_path
}

resource "aws_lambda_function" "socket_route_lambda" {
  filename      = local.socket_route_lambda.lambda_zip_path
  function_name = local.socket_route_lambda.function_name
  role          = var.lambda_role_arn
  handler       = local.socket_route_lambda.handler
  timeout       = 90

  tags = {
    service       = var.service_name
    function_name = local.socket_route_lambda.function_name
  }

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  source_code_hash = filebase64sha256(local.socket_route_lambda.lambda_zip_path)

  runtime = local.socket_route_lambda.runtime
  layers  = [var.core_lib_layer_arn, var.python_libs_layer_arn, var.image_processing_layer_arn]

  environment {
    variables = {
      SECRET_KEY              = var.SECRET_KEY
      USER_MESSAGE_TABLE_NAME = var.message_dynamodb_table.name
      USER_TABLE_NAME         = var.users_dynamodb_table.name
      CONNECTION_TABLE_NAME   = var.socket_connection_dynamodb_table.name
      ROOM_TABLE_NAME         = var.room_dynamodb_table.name
      SOCKET_URL              = "https://7wkf4olvsa.execute-api.ap-southeast-1.amazonaws.com/dev"
      IS_USING_LOCAL_DYNAMODB = 0
      STAGE_NAME              = terraform.workspace
    }
  }
}

resource "aws_cloudwatch_log_group" "socket_route_log" {
  name = "/aws/lambda/${aws_lambda_function.socket_route_lambda.function_name}"

  retention_in_days = 30
}

resource "aws_lambda_permission" "socket_permission" {
  statement_id  = "AllowExecutionFromSocket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.socket_route_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  #  source_arn    = "${var.socket_api.execution_arn}/*/*/*"

  depends_on = [var.socket_api]
}
