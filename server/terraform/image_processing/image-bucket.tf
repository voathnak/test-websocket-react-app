resource "aws_s3_bucket" "image_bucket" {
  bucket = format("%s-%s-%s-%s", var.project_name, var.service_name, terraform.workspace, "image-bucket")

  force_destroy = true

  #  lifecycle {
  #
  #    # Any Terraform plan that includes a destroy of this resource will
  #    # result in an error message.
  #    #
  #    prevent_destroy = true
  #  }
}

resource "aws_s3_bucket_cors_configuration" "bucket_cors_configuration" {
  bucket = aws_s3_bucket.image_bucket.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = [
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2",
      "ETag"
    ]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.image_bucket.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "allow_access_public" {
  bucket = aws_s3_bucket.image_bucket.id
  policy = data.aws_iam_policy_document.allow_access_from_public.json
}

#resource "aws_s3_bucket_policy" "allow_write" {
#  bucket = aws_s3_bucket.image_bucket.id
#  policy = data.aws_iam_policy_document.allow_access_from_know_account.json
#}

data "aws_iam_policy_document" "allow_access_from_public" {
  statement {
    sid = "allow_access_from_public-image_bucket"
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]

    effect = "Allow"

    resources = [
      aws_s3_bucket.image_bucket.arn,
      "${aws_s3_bucket.image_bucket.arn}/*",
    ]
  }
}
#
#data "aws_iam_policy_document" "allow_access_from_know_account" {
#  statement {
#    principals {
#      type        = "AWS"
#      identifiers = ["arn:aws:iam::097947100355:user/vlim"]
#    }
#
#    actions = [
#      "s3:PutObject",
#      "s3:PutObjectAcl"
#    ]
#
#    effect = "Allow"
#
#    resources = [
#      aws_s3_bucket.image_bucket.arn,
#      "${aws_s3_bucket.image_bucket.arn}/*",
#    ]
#  }
#}
