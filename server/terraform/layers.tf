locals {
  core_lib_layer_zip_path = "outputs/core_lib_layer.zip"
  python_libs_layer_zip_path = "outputs/python_libs_layer.zip"
}

data "archive_file" "core-lib-layer-archive" {
  type        = "zip"
  source_dir = "/Users/vlim/Research/poc/chatApp/server/layer/core"
  output_path = local.core_lib_layer_zip_path
}

resource "aws_lambda_layer_version" "core_lib_layer" {
  filename   = local.core_lib_layer_zip_path
  layer_name = format("%s-%s", var.project_name, "CoreLibs")
  source_code_hash = filebase64sha256(local.core_lib_layer_zip_path)

  compatible_runtimes = ["python3.8"]
}

data "archive_file" "python-libs-layer-archive" {
  type        = "zip"
  source_dir = "/Users/vlim/Research/poc/chatApp/server/layer/python_libs"
  output_path = local.python_libs_layer_zip_path
}

resource "aws_lambda_layer_version" "python_libs_layer" {
  filename   = local.python_libs_layer_zip_path
  layer_name = format("%s-%s", var.project_name, "PythonLibs")
  source_code_hash = filebase64sha256(local.python_libs_layer_zip_path)

  compatible_runtimes = ["python3.8"]
}
