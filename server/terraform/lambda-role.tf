resource "aws_iam_role" "lambda_assume_role" {
  name = "${var.project_name}_lambda_role_${terraform.workspace}_v${var.changes_version}"

  assume_role_policy = file("iam/lambda-assume-policy.json")
}

resource "aws_iam_role" "full_access_dynamodb_lambda_role" {
  name = "${var.project_name}_${terraform.workspace}_v${var.changes_version}_full_access_dynamodb_lambda_role"

  assume_role_policy = file("iam/lambda-assume-policy.json")
}

resource "aws_iam_role" "invocation_role" {
  name = "${var.project_name}_${terraform.workspace}_v${var.changes_version}_api_gateway_auth_invocation"
  path = "/"
  assume_role_policy =  file("iam/lambda-assume-policy.json")
}
