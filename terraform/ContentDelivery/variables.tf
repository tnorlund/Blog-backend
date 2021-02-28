// Create a variable for our domain name because we'll be using it a lot.
variable "www_domain_name" {
  type = string
  description = "The domain with the www before it."
  default = "www.tylernorlund.com"
}

// We'll also need the root domain (also known as zone apex or naked domain).
variable "root_domain_name" {
  type = string
  description = "The domain with nothing before it."
  default = "tylernorlund.com"
}