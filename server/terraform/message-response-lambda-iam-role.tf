resource "aws_iam_role_policy" "dynamodb_read_log_policy" {
  name   = "${var.project_name}-${terraform.workspace}-lambda-dynamodb-log-policy"
  role   = aws_iam_role.lambda_assume_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Action": [ "logs:*" ],
        "Effect": "Allow",
        "Resource": [ "arn:aws:logs:*:*:*" ]
    },
    {
        "Action": [ "dynamodb:BatchGetItem",
                    "dynamodb:GetItem",
                    "dynamodb:GetRecords",
                    "dynamodb:Scan",
                    "dynamodb:Query",
                    "dynamodb:GetShardIterator",
                    "dynamodb:DescribeStream",
                    "dynamodb:ListStreams" ],
        "Effect": "Allow",
        "Resource": [
          "${aws_dynamodb_table.message-dynamodb-table.arn}",
          "${aws_dynamodb_table.message-dynamodb-table.arn}/*"
        ]
    }
  ]
}
EOF
}