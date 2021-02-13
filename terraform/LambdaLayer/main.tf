# Adds a NodeJS or Python Lambda Layer

# Create an S3 Bucket to store the code data
resource "aws_s3_bucket" "bucket" {
  bucket = "blog-code-${var.stage}"
  acl    = "private"
  tags = {
    Project   = "Blog"
    Stage     = var.stage
    Developer = var.developer
  }
}

# Upload the compressed code to the S3 bucket
resource "aws_s3_bucket_object" "object" {
  bucket = aws_s3_bucket.bucket.bucket
  key    = var.type == "nodejs" ? "nodejs.zip" : "python.zip"
  source = var.type == "nodejs" ? "${var.path}/nodejs.zip" : "${var.path}/python.zip"
}

# Use the uploaded code as the Lambda Layer's code
resource "aws_lambda_layer_version" "layer" {
  layer_name = var.type == "nodejs" ? "analytics_js" : "analytics_python"
  s3_bucket = aws_s3_bucket.bucket.bucket
  s3_key = aws_s3_bucket_object.object.key

  description = var.type == "nodejs" ? "Node Framework used to access DynamoDB" : "Python Framework used to access DynamoDB"
  compatible_runtimes = var.type == "nodejs" ? ["nodejs12.x"] : ["python3.8"]
}

