resource "aws_dynamodb_table" "users-dynamodb-table" {
  name           = "${var.project_name}-${terraform.workspace}-users-dynamodb"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }


  tags = {
    Name        = "${var.project_name}-${terraform.workspace}-users-dynamodb"
    Environment = terraform.workspace
  }

#  force_destroy = true

  lifecycle {
    prevent_destroy = false
#    prevent_destroy = true
  }
}