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

variable "changes_version" {
  description = "version"

  type    = string
  default = "i"
}

variable "project_name" {
  description = "Project name"

  type    = string
  default = "vlim-ws-chat"
}

variable "domain_name" {
  type    = string
  default = "vlim.co"
}

variable "SECRET_KEY" {
  description = "SECRET_KEY"

  type    = string
  default = "62fec8f63ccfeeb60149f4c49fbcda10"
}

variable "accountId" {
  description = "accountId"

  type    = string
  default = "097947100355"
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

variable "route_set" {
  type = list(object({
    name        = string
    key         = string
    source_file = string
  }))

  default = [
    { name : "default", key : "$default", source_file : "../service" },
    { name : "connect", key : "$connect", source_file : "../service" },
    { name : "disconnect", key : "$disconnect", source_file : "../service" },
    { name : "configuration", key : "configuration", source_file : "../service" },
    { name : "sendmessage", key : "sendmessage", source_file : "../service" },
  ]
}


variable "message_dynamodb_table" {
  description = "message_dynamodb_table"
  type        = object({
    name       = string
    arn        = string
    stream_arn = string
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

variable "lambda_role_arn" {
  description = "lambda_role_arn"
  type        = string
}