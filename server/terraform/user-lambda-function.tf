
locals {
  user_lambda = {
    lambda_zip_path = "outputs/user-lambda.zip"
    function_name = format("%s-%s-ver-%s-%s", var.project_name, terraform.workspace, var.changes_version, "user")
    handler = "handler.lambda_handler"
    runtime = "python3.8"
  }
}

data "archive_file" "user-lambda-archive" {
  type        = "zip"
  source_file = "../users/handler.py"
  output_path = local.user_lambda.lambda_zip_path
}


resource "aws_lambda_function" "user" {
  filename      = local.user_lambda.lambda_zip_path
  function_name = local.user_lambda.function_name
  role          = aws_iam_role.full_access_dynamodb_lambda_role.arn
  handler       = local.user_lambda.handler
  runtime       = local.user_lambda.runtime

  layers = [aws_lambda_layer_version.core_lib_layer.arn, aws_lambda_layer_version.python_libs_layer.arn]

  source_code_hash = filebase64sha256(local.user_lambda.lambda_zip_path)

  environment {
    variables = {
      SECRET_KEY = var.SECRET_KEY
      USER_MESSAGE_TABLE_NAME = aws_dynamodb_table.message-dynamodb-table.name
      USER_TABLE_NAME = aws_dynamodb_table.users-dynamodb-table.name
      CONNECTION_TABLE_NAME = "vlim-ws-chat-dev-i--conns-table"
      SOCKET_URL = "https://m4f2567sdd.execute-api.ap-southeast-1.amazonaws.com/dev-i-vi"
      IS_USING_LOCAL_DYNAMODB = 0
      STAGE_NAME = terraform.workspace
    }
  }
}

resource "aws_cloudwatch_log_group" "user" {
  name = "/aws/lambda/${aws_lambda_function.user.function_name}"

  retention_in_days = 7
}
