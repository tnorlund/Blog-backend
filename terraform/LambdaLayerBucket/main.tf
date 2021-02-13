# Create an S3 Bucket to store the code used in the Lambda Layers
resource "aws_s3_bucket" "bucket" {
  bucket = "blog-code-${var.stage}"
  acl    = "private"
  tags = {
    Project   = "Blog"
    Stage     = var.stage
    Developer = var.developer
  }
}