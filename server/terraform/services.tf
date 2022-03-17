module "image_processing" {
  source                     = "./image_processing"
  aws_region                 = var.aws_region
  project_name               = var.project_name
  core_lib_layer_arn         = aws_lambda_layer_version.core_lib_layer.arn
  python_libs_layer_arn      = aws_lambda_layer_version.python_libs_layer.arn
  image_processing_layer_arn = aws_lambda_layer_version.image_processing_libs_layer.arn
  image_resize_lsf           = "../services/image_processing/lambdas/image_resize/handler.py"
  image_upload_url_lsf       = "../services/image_processing/lambdas/image_upload_presign_url/handler.py"
  rest_api                   = aws_api_gateway_rest_api.root_api
  image_sizes                = jsonencode([
    { key : "100x100", value : [100, 100] },
    { key : "300x300", value : [300, 300] },
    { key : "720x720", value : [720, 720] },
  ])
}