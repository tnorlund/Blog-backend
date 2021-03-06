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

/**
 * An S3 bucket is used to host the static code. This is available to the public
 * and uses a policy that allows for public access.
 */
resource "aws_s3_bucket" "dev" {
  bucket = var.dev_domain_name
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
      "Resource":["arn:aws:s3:::${var.dev_domain_name}/*"]
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
 * The development Cloudfront Distribution is used for the dev domain.
 */
resource "aws_cloudfront_distribution" "dev_distribution" {
  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
    domain_name = aws_s3_bucket.dev.website_endpoint
    origin_id   = var.dev_domain_name
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.dev_domain_name
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

  aliases = [var.dev_domain_name]

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
 * This Route 53 Record redirects the dev Cloudfront Distribution to the dev
 * domain name, dev.<domain>.com.
 */
resource "aws_route53_record" "dev" {
  zone_id = aws_route53_zone.zone.zone_id

  // NOTE: name is blank here.
  name = var.dev_domain_name
  type = "A"

  alias {
    name                   = aws_cloudfront_distribution.dev_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.dev_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

/**
 * This Route 53 record is what the REST API uses.
 */
resource "aws_route53_record" "api" {
  for_each = {
    for dvo in aws_acm_certificate.certificate.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = dvo.domain_name == var.api_domain_name ? aws_route53_zone.zone.zone_id : aws_route53_zone.zone.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id
}


/**
 * Validate the API's certificate in order to apply it.
 */
resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.api : record.fqdn]
}