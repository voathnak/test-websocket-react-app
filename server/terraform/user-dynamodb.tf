resource "aws_dynamodb_table" "users-dynamodb-table" {
  name           = "${var.project_name}-${terraform.workspace}-users-dynamodb"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "username"

  attribute {
    name = "username"
    type = "S"
  }


  tags = {
    Name        = "${var.project_name}-${terraform.workspace}-users-dynamodb"
  }

#  force_destroy = true

  lifecycle {
    prevent_destroy = false
#    prevent_destroy = true
  }
}