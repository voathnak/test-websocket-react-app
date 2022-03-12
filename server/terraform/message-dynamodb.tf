resource "aws_dynamodb_table" "message-dynamodb-table" {
  name           = "${var.project_name}-${terraform.workspace}-user-messages-dynamodb"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "userId"
  range_key      = "timestamp"
  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }


  tags = {
    Name        = "${var.project_name}-${terraform.workspace}-user-messages-dynamodb"
    Environment = terraform.workspace
  }

#  force_destroy = true

  lifecycle {
    prevent_destroy = false
#    prevent_destroy = true
  }
}