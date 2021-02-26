variable "integrations" {
  type = list( string )
}

variable "stage" {
  type = string
  default = "dev"
  description = "The stage of the production."
}

variable "api_gateway_id" {
  type = string
  description = "The ID of API Gateway"
}
