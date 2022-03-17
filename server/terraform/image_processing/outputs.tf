output "function_name" {
  description = "Name of the Lambda function."

  value = aws_lambda_function.image_upload_url_lambda.function_name
}

output "deployment_sha" {
  description = "deployment_sha"

  value = module.post_url_gateway_resource.deployment_sha
}

output "image_bucket_domain_name" {
  description = "bucket_domain_name"

  value = aws_s3_bucket.image_bucket.bucket_domain_name
}
