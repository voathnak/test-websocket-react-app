data "aws_iam_policy_document" "lambda_logs_access_docs" {
  statement {
    actions   = ["logs:*"]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

data "aws_iam_policy_document" "lambda_assume_role_policy_docs" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "lambda_logs_policy" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_lambda_logs_policy"
  role = aws_iam_role.lambda_role.id

  policy = data.aws_iam_policy_document.lambda_logs_access_docs.json
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_lambda_role"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy_docs.json
}

resource "aws_iam_role" "presign_url_lambda_role" {
  name = "${var.project_name}_${var.service_name}_${terraform.workspace}_presign_url_lambda_role"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy_docs.json
}

resource "aws_iam_role_policy" "presign_url_policy" {
  name   = "${var.project_name}_${var.service_name}_${terraform.workspace}_presign_url_invocation_policy"
  role   = aws_iam_role.presign_url_lambda_role.id
  policy = data.aws_iam_policy_document.presign_url_lambda_policy_docs.json
}


data "aws_iam_policy_document" "presign_url_lambda_policy_docs" {
  source_policy_documents = [
    data.aws_iam_policy_document.presign_url_lambda_invoke_function_policy.json,
    data.aws_iam_policy_document.allow_s3_full_access_from_lambda.json,
    data.aws_iam_policy_document.lambda_logs_access_docs.json
  ]
}

data "aws_iam_policy_document" "presign_url_lambda_invoke_function_policy" {
  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [aws_lambda_function.image_upload_url_lambda.arn]
  }
}

# resource "aws_iam_policy" "s3_lambda_policy" {
#  name        = "${var.project_name}_${var.service_name}_${terraform.workspace}-s3-lambda-policy"
#  description = "Allow lambda to access s3 policy"
#  policy      = data.aws_iam_policy_document.allow_access_from_lambda.json
#}

data "aws_iam_policy_document" "allow_s3_full_access_from_lambda" {
  statement {
    actions   = ["logs:*"]
    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    sid = "UniqueSidOne"

    actions   = ["s3:*"]
    resources = [
      aws_s3_bucket.image_bucket.arn,
      "${aws_s3_bucket.image_bucket.arn}/*",
    ]
  }
}
