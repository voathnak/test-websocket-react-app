variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "ap-southeast-1"
}

variable "service_name" {
  description = "Microservice name"

  type    = string
  default = "image-processing"
}

variable "image_sizes" {
  description = "image_sizes json"

  type    = string
  default = "[{\"key\": \"100x100\", \"value\": [100, 100]}, {\"key\": \"300x300\", \"value\": [300, 300]}, {\"key\": \"720x720\", \"value\": [720, 720]}]"
}

variable "project_name" {
  description = "Project name"

  type    = string
  default = "vlim-ws-chat"
}

variable "runtime" {
  description = "python runtime"

  type    = string
  default = "python3.8"
}

variable "core_lib_layer_arn" {
  description = "core_lib_layer_arn"

  type = string
}

variable "python_libs_layer_arn" {
  description = "python_libs_layer_arn"

  type = string
}

variable "image_processing_layer_arn" {
  description = "image_processing_layer_arn"

  type = string
}

variable "image_resize_lsf" {
  description = "image_resize_lambda_source_file"

  type = string
}

variable "image_upload_url_lsf" {
  description = "image_upload_url_lambda_source_file"

  type = string
}

variable "rest_api" {
  type = object({
    name             = string
    id               = string
    root_resource_id = string
    execution_arn    = string
  })
}