/**
 * Most of this is from here:
 * https://jeffrafter.com/terraform-and-aws/
 */
resource "aws_route53_zone" "domain_zone" {
  name = var.domain
}

# An ACM certificate is needed to apply a custom domain name
# to the API Gateway resource and cloudfront distributions
resource "aws_acm_certificate" "cert" {
  domain_name       = aws_route53_zone.domain_zone.name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${aws_route53_zone.domain_zone.name}",
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# AWS needs to verify that we own the domain; to prove this we will create a
# DNS entry with a validation code
resource "aws_route53_record" "cert_validation_record" {
  name    = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_type
  records = [tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_value]
  zone_id = aws_route53_zone.domain_zone.zone_id
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation_record.fqdn]
}

/**
 * Use an S3 Bucket to store the content before deploy.
 */
resource "aws_s3_bucket" "deploys" {
  bucket = var.deploys_bucket
  acl    = "private"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

/**
 * Use an S3 Bucket to host the static site.
 */
resource "aws_s3_bucket" "site" {
  bucket = var.domain
  acl    = "public-read"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::${var.domain}/*"
            ]
        }
    ]
}
EOF

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["https://${var.domain}"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_cloudfront_distribution" "site_distribution" {
  origin {
    domain_name = aws_s3_bucket.site.bucket_domain_name
    origin_id   = var.domain
  }

  enabled             = true
  aliases             = [var.domain]
  price_class         = "PriceClass_100"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.domain

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }
}

resource "aws_route53_record" "site" {
  name    = var.domain
  type    = "A"
  zone_id = aws_route53_zone.domain_zone.zone_id

  alias {
    name                   = aws_cloudfront_distribution.site_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.site_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}