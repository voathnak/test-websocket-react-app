resource "aws_iam_role_policy" "lambda_assume_policy" {
  name = "${var.project_name}_lambda_assume_policy_${terraform.workspace}_ver-${var.changes_version}"
  role = aws_iam_role.lambda_assume_role.id

  policy = file("iam/lambda-policy.json")
}

resource "aws_iam_role_policy" "full_access_dynamodb_lambda_policy" {
  name = "${var.project_name}_${terraform.workspace}_ver-${var.changes_version}_full_access_dynamodb_lambda_policy"
  role = aws_iam_role.full_access_dynamodb_lambda_role.id

  policy = file("iam/full-access-dynamodb-lambda-policy.json")
}

resource "aws_iam_role_policy" "invocation_policy" {
  name = "${var.project_name}_${terraform.workspace}_ver-${var.changes_version}_invocation_policy"
  role = aws_iam_role.invocation_role.id
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "lambda:InvokeFunction",
        "Effect" : "Allow",
        "Resource" : aws_lambda_function.authorizer.arn
      }
    ]
  })
#  policy = <<EOF
#{
#  "Version": "2012-10-17",
#  "Statement": [
#    {
#      "Action": "lambda:InvokeFunction",
#      "Effect": "Allow",
#      "Resource": "${aws_lambda_function.authorizer.arn}"
#    }
#  ]
#}
#EOF
}