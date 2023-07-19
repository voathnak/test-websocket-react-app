resource "aws_dynamodb_table" "room-dynamodb-table" {
  name           = "${var.project_name}-${terraform.workspace}-room-dynamodb"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "name"

  attribute {
    name = "name"
    type = "S"
  }


  tags = {
    Name        = "${var.project_name}-${terraform.workspace}-room-dynamodb"
  }

  lifecycle {
    prevent_destroy = false
#    prevent_destroy = true
  }
}