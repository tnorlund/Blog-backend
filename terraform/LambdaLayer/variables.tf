variable "path" {
  type = string
  description = "The path to the '.zip' that contains the layer's code"
}

variable "type" {
  type = string
  description = "Whether the layer is python or nodejs"
}

variable "stage" {
  type = string
  default = "dev"
  description = "The stage of the production."
}

variable "developer" {
  type = string
  description = "The name of the developer making the change"
}

variable "bucket_name" {
  type = string
  description = "The name of the S3 bucket used to hold the uploaded code"
}