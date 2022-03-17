locals {
  image_resize_lambda = {
    lambda_zip_path = "outputs/image-resize-lambda.zip"
    function_name = format("%s-%s-%s-%s", var.project_name, var.service_name, "image_resize", terraform.workspace)
    handler = "handler.handler"
    runtime = var.runtime
  }
}

data "archive_file" "image-resize-lambda-archive" {
  type        = "zip"
  source_file = var.image_resize_lsf
  output_path = local.image_resize_lambda.lambda_zip_path
}

resource "aws_lambda_function" "image_resize_lambda" {
  filename      = local.image_resize_lambda.lambda_zip_path
  function_name = local.image_resize_lambda.function_name
  role          = aws_iam_role.lambda_role.arn
  handler       = local.image_resize_lambda.handler
  timeout = 90

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
#  source_code_hash = filebase64sha256(local.image_resize_lambda.lambda_zip_path)

  runtime = local.image_resize_lambda.runtime
  layers = [var.core_lib_layer_arn, var.python_libs_layer_arn, var.image_processing_layer_arn]

  environment {
    variables = {
      IMAGE_BUCKET_DOMAIN = aws_s3_bucket.image_bucket.bucket_domain_name
      IMAGE_BUCKET_NAME = aws_s3_bucket.image_bucket.bucket
      IMAGE_SIZES = var.image_sizes
    }
  }
}

resource "aws_cloudwatch_log_group" "image_resize" {
  name = "/aws/lambda/${aws_lambda_function.image_resize_lambda.function_name}"

  retention_in_days = 30
}

resource "aws_lambda_permission" "allow_bucket_permission" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_resize_lambda.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.image_bucket.arn
}
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.image_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.image_resize_lambda.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "original/"
    filter_suffix       = ".jpg"
  }


  lambda_function {
    lambda_function_arn = aws_lambda_function.image_resize_lambda.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "original/"
    filter_suffix       = ".jpeg"
  }


  lambda_function {
    lambda_function_arn = aws_lambda_function.image_resize_lambda.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "original/"
    filter_suffix       = ".png"
  }

  depends_on = [aws_lambda_permission.allow_bucket_permission]
}