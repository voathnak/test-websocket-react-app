resource "aws_iam_role_policy" "lambda_assume_policy" {
  name = "${var.service_name}_lambda_policy_${terraform.workspace}"
  role = aws_iam_role.lambda_assume_role.id

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  #  policy = jsonencode()
  policy = file("iam/lambda-policy.json")
}

resource "aws_iam_role" "lambda_assume_role" {
  name = "${var.service_name}_lambda_role_${terraform.workspace}"

  assume_role_policy = file("iam/lambda-assume-policy.json")
}