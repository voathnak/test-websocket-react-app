variable "aws_region" {
  description = "AWS region for all resources."
  type    = string
  default = "ap-southeast-1"
}

variable "service_name" {
  description = "Microservice name"
  type    = string
  default = "chat-engine"
}

variable "project_name" {
  description = "Project name"
  type    = string
  default = "vlim-ws-chat"
}

variable "SECRET_KEY" {
  description = "SECRET_KEY"
  type    = string
  default = "62fec8f63ccfeeb60149f4c49fbcda10"
}

variable "message_dynamodb_table" {
  description = "message_dynamodb_table"
  type        = object({
    name = string
    arn  = string
  })
}

variable "users_dynamodb_table" {
  description = "users_dynamodb_table"
  type        = object({
    name = string
    arn  = string
  })
}

variable "socket_connection_dynamodb_table" {
  description = "socket_connection_dynamodb_table"
  type        = object({
    name = string
    arn  = string
  })
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

variable "route_lambda_lsf" {
  description = "route_lambda_lambda_source_file"

  type = string
}

variable "function_name" {
  description = "function_name"

  type = string
}

variable "route_key" {
  description = "route_key"

  type    = string
  default = "$default"
}

variable "lambda_role_arn" {
  description = "lambda_role_arn"
  type    = string
}

variable "socket_api" {
  type = object({
    name          = string
    id            = string
    execution_arn = string
  })
}