variable "developer" {
  type = string
  description = "The name of the developer making the change"
}

variable "bucket_name" {
  type = string
  description = "The name of the S3 bucket used to hold the uploaded code"
}

variable "node_layer_arn" {
 type = string
 description = "The Lambda Layer's ARN" 
}

variable "python_layer_arn" {
  type = string
  description = "The Python Lambda Layer's ARN"
}

# The name of the DynamoDB table.
variable "table_name" {
  type = string
  description = "The name of the DynamoDB table"
}

variable "region" {
  type = string
  description = "The region for the S3 bucket and the DynamoDB table"
}

# The primary index's read and write capcities.
variable "write_capacity" {
  type = number
  default = 5
  description = "The write capacity of the Primary Index"
}
variable "read_capacity" {
  type = number
  default = 5
  description = "The read capacity of the Primary Index"
}

# The first Global Secondary index's read and write capacities.
variable "gsi1_write_capacity" {
  type = number
  default = 5
  description = "The write capcity of the first Global Secondary Index"
}
variable "gsi1_read_capacity" {
  type = number
  default = 5
  description = "The read capcity of the first Global Secondary Index"
}

# The second Global Secondary index's read and write capacities.
variable "gsi2_write_capacity" {
  type = number
  default = 5
  description = "The write capcity of the second Global Secondary Index"
}
variable "gsi2_read_capacity" {
  type = number
  default = 5
  description = "The read capcity of the second Global Secondary Index"
}

variable "ipify_key" {
  type = string
  description = "The IPIFY key used to make REST queries"
}