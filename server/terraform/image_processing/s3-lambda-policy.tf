resource "aws_iam_policy" "s3_lambda_policy" {
  name        = "${var.project_name}_${var.service_name}_${terraform.workspace}-s3-lambda-policy"
  description = "Allow lambda to access s3 policy"
  policy      = data.aws_iam_policy_document.allow_access_from_lambda.json
}

data "aws_iam_policy_document" "allow_access_from_lambda" {
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

