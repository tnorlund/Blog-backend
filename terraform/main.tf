terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.28.0"
    }
  }
  required_version = "~> 0.14"

  backend "remote" {
    organization = "tnorlund"

    workspaces {
      name = "gh-actions-demo"
    }
  }
}

variable "ipify_key" {
  type        = string
  description = "The ipify key used to make REST queries"
}

variable "aws_region" {
  type        = string
  description = "The AWS region"
  default     = "us-east-1"
}

variable "stage" {
  type        = string
  description = "The stage of development"
  default     = "dev"
}

variable "api_name" {
  type    = string
  default = "blog_api"
}

variable "domain" {
  default = "tylernorlund.com"
}

/**
 * The AWS provider should be handled by ENV vars. 
 */
provider "aws" {
  region = var.aws_region
}

/**
 * The Python and NodeJS Lambda Layers should be uploaded to the bucket created
 * above.
 */
module "python_layer" {
  source      = "./LambdaLayer"
  type        = "python"
  developer   = "Tyler Norlund"
  bucket_name = "tf-cloud"
}
module "node_layer" {
  source      = "./LambdaLayer"
  type        = "nodejs"
  developer   = "Tyler Norlund"
  bucket_name = "tf-cloud"
}

/**
 * The Analytics module handles the Kinesis Firehose, DynamoDB, and the Lambda
 * Functions used with them.
 */
module "analytics" {
  source           = "./AnalyticsDynamo"
  developer        = "Tyler Norlund"
  bucket_name      = "tf-cloud"
  table_name       = "Blog"
  region           = var.aws_region
  node_layer_arn   = module.node_layer.arn
  python_layer_arn = module.python_layer.arn
  ipify_key        = var.ipify_key
}


// Create a variable for our domain name because we'll be using it a lot.
variable "www_domain_name" {
  default = "www.tylernorlund.com"
}

// We'll also need the root domain (also known as zone apex or naked domain).
variable "root_domain_name" {
  default = "tylernorlund.com"
}

/**
 * An S3 bucket is used to host the static code. This is available to the public
 * and uses a policy that allows for public access.
 */
resource "aws_s3_bucket" "www" {
  bucket = var.www_domain_name
  acl    = "public-read"
  policy = <<POLICY
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"AddPerm",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::${var.www_domain_name}/*"]
    }
  ]
}
POLICY
  website {
    index_document = "index.html"
    error_document = "404.html"
  }
}

/**
 * AWS Certificate Manager is used to create the SSL certificate for the domain.
 * This may take a long time to apply and requires you to confirm it with your
 * email address.
 */
resource "aws_acm_certificate" "certificate" {
  domain_name       = "*.${var.root_domain_name}"
  validation_method = "EMAIL"
  subject_alternative_names = [ var.root_domain_name ]
}

/**
 * AWS Cloudfront is used to distribute the load of the website to Amazon's 
 * edge locations.
 */
resource "aws_cloudfront_distribution" "www_distribution" {
  /**
   * The distribution's origin needs a "custom" setup in order to redirect 
   * traffic from <domain>.com to www.<domain>.com. The values bellow are the 
   * defaults.
   */
  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    /** 
     * This connects the S3 bucket created earlier to the Cloudfront 
     * distribution. 
     */
    domain_name = aws_s3_bucket.www.website_endpoint
    origin_id   = var.www_domain_name
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.www_domain_name
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  /**
   * This sets the aliases of the Cloudfront distribution. Here, it is being
   * set to be accessible by <var.www_domain_name>.
   */
  aliases = [ var.www_domain_name ]

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  /**
   * The AWS ACM Certificate is then applied to the distribution.
   */
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.certificate.arn
    ssl_support_method  = "sni-only"
  }
}

/**
 * The Route 53 Zone needs to be created so that its nameservers can point to
 * the Cloudfront Distribution.
 */
resource "aws_route53_zone" "zone" {
  name = var.root_domain_name
}

/**
 * This is the Route 53 Record that redirects to the Cloudfront Distribution.
 */
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.zone.zone_id
  name    = var.www_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.www_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

/**
 * A second bucket is used for the root domain, <domain>.com. This is 
 * redirected to www.<domain>.com.
 */
resource "aws_s3_bucket" "root" {
  bucket = var.root_domain_name
  acl    = "public-read"
  policy = <<POLICY
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"AddPerm",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::${var.root_domain_name}/*"]
    }
  ]
}
POLICY

  website {
    redirect_all_requests_to = "https://${var.www_domain_name}"
  }
}

/**
 * A second Cloudfront Distribution is used for the root domain. This is the 
 * same as the other distribution but accesses the root S3 bucket.
 */
resource "aws_cloudfront_distribution" "root_distribution" {
  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
    domain_name = aws_s3_bucket.root.website_endpoint
    origin_id   = var.root_domain_name
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.root_domain_name
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  aliases = [var.root_domain_name]

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.certificate.arn
    ssl_support_method  = "sni-only"
  }
}

/**
 * This Route 53 Record redirects the root Cloudfront Distribution to the root
 * domain name, <domain>.com.
 */
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.zone.zone_id

  // NOTE: name is blank here.
  name = ""
  type = "A"

  alias {
    name                   = aws_cloudfront_distribution.root_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.root_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# module "identity" {
#   source                      = "./Identity"
#   developer                   = "Tyler Norlund"
#   user_pool_name              = "blog_user_pool"
#   identity_pool_name          = "blog_identity_pool"
#   firehose_arn                = module.analytics.firehose_arn
#   api_name                    = var.api_name
#   domain                      = var.domain
#   custom_message_path         = "../code/lambda"
#   custom_message_file_name    = "custom_message"
#   post_confirmation_path      = "../code/lambda"
#   post_confirmation_file_name = "post_confirmation"
#   dynamo_arn                  = module.analytics.dynamo_arn
#   table_name                  = module.analytics.dynamo_table_name
#   node_layer_arn              = module.node_layer.arn
# }

# resource "aws_api_gateway_authorizer" "authorizer" {
#   name          = "CognitoUserPoolAuthorizer"
#   type          = "COGNITO_USER_POOLS"
#   rest_api_id   = module.identity.api_gateway_id
#   provider_arns = [
#     module.identity.user_pool_arn
#   ]
# }

# module "api_blog" {
#   source                       = "./API_blog"
#   get_path                     = "../code/lambda"
#   get_file_name                = "get_blog"
#   post_path                    = "../code/lambda"
#   post_file_name               = "post_blog"
#   method_name                  = "getBlog"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   developer                    = "Tyler Norlund"
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_project" {
#   source                        = "./API_project"
#   get_path                      = "../code/lambda"
#   get_file_name                 = "get_project"
#   get_details_path              = "../code/lambda"
#   get_details_file_name         = "get_project_details"
#   post_path                     = "../code/lambda"
#   post_file_name                = "post_project"
#   post_project_update_path      = "../code/lambda"
#   post_project_update_file_name = "post_project_update"
#   method_name                   = "getProject"
#   post_project_follow_path      = "../code/lambda"
#   post_project_follow_file_name = "post_project_follow"
#   delete_project_follow_path      = "../code/lambda"
#   delete_project_follow_file_name = "delete_project_follow"
#   delete_project_path           = "../code/lambda"
#   delete_project_file_name      = "delete_project"
#   developer                     = "Tyler Norlund"
#   api_gateway_id                = module.identity.api_gateway_id
#   api_gateway_execution_arn     = module.identity.api_gateway_execution_arn
#   api_gateway_arn               = module.identity.api_gateway_arn
#   api_gateway_root_resource_id  = module.identity.api_gateway_root_resource_id
#   table_name                    = module.analytics.dynamo_table_name
#   dynamo_arn                    = module.analytics.dynamo_arn
#   node_layer_arn                = module.node_layer.arn
# }

# module "api_comment" {
#   source                       = "./API_comment"
#   post_comment_path            = "../code/lambda"
#   post_comment_file_name       = "post_comment"
#   delete_comment_path            = "../code/lambda"
#   delete_comment_file_name       = "delete_comment"
#   post_reply_path              = "../code/lambda"
#   post_reply_file_name         = "post_reply"
#   post_vote_path               = "../code/lambda"
#   post_vote_file_name          = "post_vote"
#   delete_vote_path             = "../code/lambda"
#   delete_vote_file_name        = "delete_vote"
#   developer                    = "Tyler Norlund"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_post" {
#   source                       = "./API_Post"
#   post_post_path               = "../code/lambda"
#   post_post_file_name          = "post_post"
#   get_post_path                = "../code/lambda"
#   get_post_file_name           = "get_post"
#   delete_post_path             = "../code/lambda"
#   delete_post_file_name        = "delete_post"
#   get_post_details_path        = "../code/lambda"
#   get_post_details_file_name   = "get_post_details"
#   developer                    = "Tyler Norlund"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_tos" {
#   source                       = "./API_tos"
#   post_tos_path                = "../code/lambda"
#   post_tos_file_name           = "post_tos"
#   developer                    = "Tyler Norlund"
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_user" {
#   source                       = "./API_user"
#   get_user_path                = "../code/lambda"
#   get_user_file_name           = "get_user"
#   get_user_details_path        = "../code/lambda"
#   get_user_details_file_name   = "get_user_details"
#   post_user_name_path          = "../code/lambda"
#   post_user_name_file_name     = "post_user_name"
#   post_disable_user_path       = "../code/lambda"
#   post_disable_user_file_name  = "post_disable_user"
#   developer                    = "Tyler Norlund"
#   authorizer_id                = aws_api_gateway_authorizer.authorizer.id
#   user_pool_id                 = module.identity.user_pool_id
#   user_pool_arn                = module.identity.user_pool_arn
#   api_gateway_id               = module.identity.api_gateway_id
#   api_gateway_execution_arn    = module.identity.api_gateway_execution_arn
#   api_gateway_arn              = module.identity.api_gateway_arn
#   api_gateway_root_resource_id = module.identity.api_gateway_root_resource_id
#   table_name                   = module.analytics.dynamo_table_name
#   dynamo_arn                   = module.analytics.dynamo_arn
#   node_layer_arn               = module.node_layer.arn
# }

# module "api_deployment" {
#   source         = "./API_deploy"
#   api_gateway_id = module.identity.api_gateway_id
#   integrations   = concat(
#     module.api_blog.integrations,
#     module.api_project.integrations,
#     module.api_comment.integrations,
#     module.api_post.integrations,
#     module.api_tos.integrations,
#     module.api_user.integrations,
#   )
#   depends_on = [ module.api_comment.methods ]
# }

# module "cdn" {
#   source = "./ContentDelivery"
#   domain = var.domain
# }

# output "GATSBY_API_BLOG_ENDPOINT" {
#   value = module.api_deployment.invoke_url
# }

# output "GATSBY_COGNITO_IDENTITY_POOL_ID" {
#   value = module.identity.identity_pool_id
# }

# output "GATSBY_USER_POOLS_ID" {
#   value = module.identity.user_pool_id
# }

# output "GATSBY_USER_POOLS_CLIENT_ID" {
#   value = module.identity.user_pool_client_id
# }

output "GATSBY_DYNAMO_TABLE" {
  value = module.analytics.dynamo_table_name
}

output "GATSBY_ANALYTICS_FIREHOSE" {
  value = module.analytics.firehose_stream_name
}

# output "GATSBY_AWS_REGION" {
#   value = var.aws_region
# }

# output "GATSBY_ANALYTICS_REGION" {
#   value = var.aws_region
# }

# output "GATSBY_API_BLOG_NAME" {
#   value = var.api_name
# }
