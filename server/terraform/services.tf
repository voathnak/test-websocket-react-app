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

module "chat_engine" {
  source = "./chat_engine"

  core_lib_layer_arn               = aws_lambda_layer_version.core_lib_layer.arn
  python_libs_layer_arn            = aws_lambda_layer_version.python_libs_layer.arn
  image_processing_layer_arn       = aws_lambda_layer_version.image_processing_libs_layer.arn
  #  route_set                  = [
  #    { name : "connect", key : "$connect", source_file : "../onconnect/app.py" },
  #    { name : "disconnect", key : "$disconnect", source_file : "../ondisconnect/app.py" },
  #    { name : "configuration", key : "configuration", source_file : "../configuration/app.py" },
  #    { name : "sendmessage", key : "sendmessage", source_file : "../pysendmessage/app.py" },
  #  ]
  message_dynamodb_table           = aws_dynamodb_table.message-dynamodb-table
  users_dynamodb_table             = aws_dynamodb_table.users-dynamodb-table
  socket_connection_dynamodb_table = aws_dynamodb_table.socket-connection-dynamodb-table
  room_dynamodb_table              = aws_dynamodb_table.room-dynamodb-table
  lambda_role_arn                  = aws_iam_role.lambda_assume_role.arn
}