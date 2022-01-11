  variable "authorization" {
    type = string
  }
  variable "http_method" {
    type = string
  }
  variable "resource" {
    type = object({
      id = string
      path = string
    })
  }
  variable "function" {
    type = object({
      function_name = string
      invoke_arn = string
    })
  }
  variable "rest_api" {
    type = object({
      name = string
      id = string
      execution_arn = string
    })
  }