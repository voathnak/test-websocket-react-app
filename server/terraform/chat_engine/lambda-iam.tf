resource "aws_iam_role_policy" "lambda_logs_policy" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_lambda_logs_policy"
  role = aws_iam_role.socket_lambda_role.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "Stmt1636620306577",
        "Action" : "logs:*",
        "Effect" : "Allow",
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_lambda_dynamodb_policy"
  role = aws_iam_role.socket_lambda_role.id

  policy = jsonencode({
    "Statement" : [
      {
        "Action" : [
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:DescribeTable",
          "dynamodb:ConditionCheckItem"
        ],
        "Resource" : [
          "arn:aws:dynamodb:${var.aws_region}:${var.accountId}:table/${var.socket_connection_dynamodb_table.name}",
          "arn:aws:dynamodb:${var.aws_region}:${var.accountId}:table/${var.socket_connection_dynamodb_table.name}/index/*",
          "arn:aws:dynamodb:${var.aws_region}:${var.accountId}:table/${var.message_dynamodb_table.name}",
          "arn:aws:dynamodb:${var.aws_region}:${var.accountId}:table/${var.message_dynamodb_table.name}/index/*",
          "arn:aws:dynamodb:${var.aws_region}:${var.accountId}:table/${var.users_dynamodb_table.name}",
          "arn:aws:dynamodb:${var.aws_region}:${var.accountId}:table/${var.users_dynamodb_table.name}/index/*",
        ],
        "Effect" : "Allow"
      }
    ]
  })
}

resource "aws_iam_role_policy" "socket_lambda_policy" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_socket_lambda_policy"
  role = aws_iam_role.socket_lambda_role.id

  policy = data.aws_iam_policy_document.lambda_manage_socket_connection_role_policy.json
}

resource "aws_iam_role" "socket_lambda_role" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_lambda_role"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_role" "message_response_lambda_assume_role" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_message_response_lambda_assume_role"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_role_policy" "message_response_manageConnections_lambda_policy" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_message_response_manageConnections_lambda_policy"
  role = aws_iam_role.message_response_lambda_assume_role.id

  policy = data.aws_iam_policy_document.lambda_manage_socket_connection_role_policy.json
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "lambda_manage_socket_connection_role_policy" {
  statement {
    actions = ["execute-api:ManageConnections"]
    resources = [
      "arn:aws:execute-api:${var.aws_region}:${var.accountId}:${aws_apigatewayv2_api.socket_api_gateway.id}/*"
    ]
  }
}

