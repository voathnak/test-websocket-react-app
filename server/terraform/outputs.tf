output "aws_dynamodb_table_region" {
  description = "aws_dynamodb_table_region"

  value = aws_dynamodb_table.message-dynamodb-table.replica
}

output "aws_dynamodb_table_arn" {
  description = "aws_dynamodb_table_arn"

  value = aws_dynamodb_table.message-dynamodb-table.arn
}

output "message-response-lambda-function-name" {
  description = "message-response-lambda-function"

  value = aws_lambda_function.message_response_lambda.function_name
}


output "message-response-lambda-function-arn" {
  description = "message-response-lambda-function-arn"

  value = aws_lambda_function.message_response_lambda.arn
}

