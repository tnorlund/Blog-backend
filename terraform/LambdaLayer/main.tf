# Adds a NodeJS or Python Lambda Layer

data "archive_file" "layer_zip_lambda_common_layer" {
  type = "zip"
  source_dir = var.type == "nodejs" ? "${path.cwd}/${var.path}/nodejs" : "${path.cwd}/${var.path}/python"
  output_path = var.type == "nodejs" ? "${path.cwd}/${var.path}/nodejs.zip" : "${path.cwd}/${var.path}/python.zip"
}

resource "aws_lambda_layer_version" "layer" {
  layer_name = var.type == "nodejs" ? "analytics_js" : "analytics_python"
  filename = "${path.cwd}/${var.path}nodejs.zip"
  description = var.type == "nodejs" ? "Node Framework used to access DynamoDB" : "Python Framework used to access DynamoDB"
  compatible_runtimes = var.type == "nodejs" ? ["nodejs12.x"] : ["python3.7"]
}