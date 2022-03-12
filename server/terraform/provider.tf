terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region                  = "ap-southeast-1"
  shared_credentials_file = "/Users/vlim/.aws/credentials"
  profile                 = "aws1-vlim"
}