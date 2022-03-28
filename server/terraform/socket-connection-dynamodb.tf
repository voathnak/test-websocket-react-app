resource "aws_dynamodb_table" "socket-connection-dynamodb-table" {
  name           = "${var.project_name}-${terraform.workspace}-socket-connection-dynamodb"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "connectionId"

  attribute {
    name = "connectionId"
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