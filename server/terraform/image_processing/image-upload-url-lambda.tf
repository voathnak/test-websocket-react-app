locals {
  lambda_zip_path = "outputs/image-upload-url-lambda.zip"
  function_name = format("%s-%s-%s-%s", var.project_name, var.service_name, "lambda_upload_url", terraform.workspace)
  handler = "handler.get_upload_url"
  runtime = var.runtime
}

data "archive_file" "image-upload-url-lambda-archive" {
  type        = "zip"
  source_file = var.image_upload_url_lsf
  output_path = local.lambda_zip_path
}

resource "aws_lambda_function" "image_upload_url_lambda" {
  filename      = local.lambda_zip_path
  function_name = local.function_name
  role          = aws_iam_role.lambda_role.arn
  handler       = local.handler

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
#  source_code_hash = filebase64sha256(local.lambda_zip_path)

  runtime = local.runtime
  layers = [var.core_lib_layer_arn, var.python_libs_layer_arn]

  environment {
    variables = {
      IMAGE_BUCKET_DOMAIN = aws_s3_bucket.image_bucket.bucket_domain_name
      IMAGE_BUCKET_NAME = aws_s3_bucket.image_bucket.bucket
      IMAGE_SIZES = var.image_sizes
    }
  }
}

resource "aws_cloudwatch_log_group" "image_upload_url" {
  name = "/aws/lambda/${aws_lambda_function.image_upload_url_lambda.function_name}"

  retention_in_days = 30
}

