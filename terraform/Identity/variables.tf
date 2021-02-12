variable "developer" {
  type = string
  description = "The name of the developer making the change"
}

# The development stage
variable "stage" {
  type = string
  default = "dev"
  description = "The stage of the production."
}

# The development stage
variable "user_pool_name" {
  type = string
  description = "The stage of the production."
}

# The development stage
variable "identity_pool_name" {
  type = string
  description = "The stage of the production."
}

variable "firehose_arn" {
  type = string
  description = "The ARN of the Kinesis Firehose stream"
}

variable "api_name" {
  type = string
  description = "The name of the API Gateway resource"
}