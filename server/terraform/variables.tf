variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "ap-southeast-1"
}

variable "changes_version" {
  description = "version"

  type    = string
  default = "a"
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
  default = "661275851074"
}
