# Adds a NodeJS or Python Lambda Layer

# Upload the compressed code to the S3 bucket
resource "aws_s3_bucket_object" "object" {
  bucket = var.bucket_name
  key    = var.type == "nodejs" ? "nodejs.zip" : "python.zip"
  source = var.type == "nodejs" ? "${var.path}/nodejs.zip" : "${var.path}/python.zip"
  tags = {
    Project   = "Blog"
    Stage     = var.stage
    Developer = var.developer
  }
}

# Use the uploaded code as the Lambda Layer's code
resource "aws_lambda_layer_version" "layer" {
  layer_name = var.type == "nodejs" ? "analytics_js" : "analytics_python"
  s3_bucket = var.bucket_name
  s3_key = aws_s3_bucket_object.object.key

  description = var.type == "nodejs" ? "Node Framework used to access DynamoDB" : "Python Framework used to access DynamoDB"
  compatible_runtimes = var.type == "nodejs" ? ["nodejs12.x"] : ["python3.8"]
}

