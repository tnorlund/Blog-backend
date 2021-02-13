variable "stage" {
  type = string
  default = "dev"
  description = "The stage of the production."
}

variable "developer" {
  type = string
  description = "The name of the developer making the change"
}