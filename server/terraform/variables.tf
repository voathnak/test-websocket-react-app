variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "ap-southeast-1"
}

variable "service_name" {
  description = "Microservice name"

  type    = string
  default = "message-process"
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
