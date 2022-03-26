resource "aws_iam_role_policy" "dynamodb_event_read_policy" {
  name   = "${var.project_name}-${terraform.workspace}-lambda-dynamodb_event_read_policy"
  role   = aws_iam_role.message_response_lambda_assume_role.id
  policy = jsonencode({
    "Statement" : [
      {
        "Action" : ["logs:*"],
        "Effect" : "Allow",
        "Resource" : ["arn:aws:logs:*:*:*"]
      },
      {
        "Action" : [
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:GetRecords",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:DescribeTable",
          "dynamodb:ConditionCheckItem",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams",
        ],
        "Resource" : [
          var.socket_connection_dynamodb_table.arn,
          "${var.socket_connection_dynamodb_table.arn}/index/*",
          var.message_dynamodb_table.arn,
          "${var.message_dynamodb_table.arn}/index/*",
          "${var.message_dynamodb_table.arn}/stream/*",
          var.users_dynamodb_table.arn,
          "${var.users_dynamodb_table.arn}/index/*",
        ],
        "Effect" : "Allow"
      }
    ]
  })
}