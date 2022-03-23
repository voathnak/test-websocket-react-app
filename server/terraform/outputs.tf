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

output "user-lambda-function-name" {
  description = "user-lambda-function"

  value = aws_lambda_function.user.function_name
}


output "user-lambda-function-arn" {
  description = "user-lambda-function-arn"

  value = aws_lambda_function.user.arn
}


output "rootAPI" {
  description = "rootAPI"

  value = "https://${aws_api_gateway_rest_api.root_api.id}.execute-api.${var.aws_region}.amazonaws.com/${terraform.workspace}"
}

#"https://${RestApi}.execute-api.${AWS::Region}.amazonaws.com/${StageName}/todos"