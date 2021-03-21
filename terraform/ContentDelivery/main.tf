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
  domain_name               = "*.${var.root_domain_name}"
  validation_method         = "EMAIL"
  subject_alternative_names = [var.root_domain_name]
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

    realtime_log_config_arn = aws_cloudfront_realtime_log_config.analytics.arn
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
  aliases = [var.www_domain_name]

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
 * These are the permissions for the CloudFront realtime log. It requires access
 * to the Kineis data stream it uses to store the logs.
 */
resource "aws_iam_role" "analytics" {
  name = "cloudfront-realtime-log"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "analytics" {
  name = "cloudfront-realtime-log"
  role = aws_iam_role.analytics.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": [
          "kinesis:DescribeStreamSummary",
          "kinesis:DescribeStream",
          "kinesis:PutRecord",
          "kinesis:PutRecords",
          "logs:CreateLogGroup",
          "logs:PutLogEvents",
          "logs:CreateLogStream"
        ],
        "Resource": [
          "${aws_kinesis_stream.analytics.arn}",
          "arn:aws:logs:*:*:*"
        ]
    }
  ]
}
EOF
}

/**
 * This is the realtime logging of the main CloudFront distribution.
 *
 * The fields recorded can be found here:
 *   https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/real-time-logs.html#understand-real-time-log-config-fields
 */
resource "aws_cloudfront_realtime_log_config" "analytics" {
  name          = "analytics"
  sampling_rate = 100
  fields = [
    "timestamp",
    "c-ip",
    "time-to-first-byte",
    "sc-status",
    "sc-bytes",
    "cs-method",
    "cs-protocol",
    "cs-host",
    "cs-uri-stem",
    "cs-bytes",
    "x-edge-location",
    "x-edge-request-id",
    "x-host-header",
    "time-taken",
    "cs-protocol-version",
    "c-ip-version",
    "cs-user-agent",
    "cs-referer",
    "cs-cookie",
    "cs-uri-query",
    "x-edge-response-result-type",
    "x-forwarded-for",
    "ssl-protocol",
    "ssl-cipher",
    "x-edge-result-type",
    "fle-encrypted-fields",
    "fle-status",
    "sc-content-type",
    "sc-content-len",
    "sc-range-start",
    "sc-range-end",
    "c-port",
    "x-edge-detailed-result-type",
    "c-country",
    "cs-accept-encoding",
    "cs-accept",
    "cache-behavior-path-pattern",
    "cs-headers",
    "cs-header-names",
    "cs-headers-count"
  ]

  endpoint {
    stream_type = "Kinesis"

    kinesis_stream_config {
      role_arn   = aws_iam_role.analytics.arn
      stream_arn = aws_kinesis_stream.analytics.arn
    }
  }

  depends_on = [aws_iam_role_policy.analytics]
}

/**
 * This is the Kinesis data stream used by the main Cloudfront realtime logging.
 */
resource "aws_kinesis_stream" "analytics" {
  name             = "blog-cloudfront-analytics"
  shard_count      = 1
  retention_period = 24

  shard_level_metrics = [
    "IncomingBytes",
    "OutgoingBytes",
  ]

  tags = {
    Environment = "test"
  }
}

/**
 * These are the permissions for the Kinesis Firehose. It requires access to 
 * the S3 bucket.
 */
data "aws_iam_policy_document" "kinesis_firehose" {
  statement {
    effect = "Allow"
    actions = [
      "kinesis:*",
      "firehose:*",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "logs:CreateLogStream"
    ]
    resources = [
      aws_kinesis_stream.analytics.arn,
      aws_kinesis_firehose_delivery_stream.extended_s3_stream.arn,
      "arn:aws:logs:*:*:*"
    ]
    sid = "kinesisId"
  }
}
resource "aws_iam_role" "kinesis_firehose" {
  name               = "cloudfront_kinesis_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "kinesis_firehose_stream" {
  policy = data.aws_iam_policy_document.kinesis_firehose.json
  role   = aws_iam_role.kinesis_firehose.id
}

resource "aws_cloudwatch_log_group" "s3_analytics" {
  name = "/aws/lambda/tylernorlund_cloudfront_analytics"
}

resource "aws_cloudwatch_log_stream" "fs3_analyticsoo" {
  name           = "tylernorlund_cloudfront_analytics"
  log_group_name = aws_cloudwatch_log_group.s3_analytics.name
}

resource "aws_kinesis_firehose_delivery_stream" "extended_s3_stream" {
  name        = "tylernorlund-cloudfront-analytics"
  destination = "extended_s3"

  kinesis_source_configuration {
    kinesis_stream_arn = aws_kinesis_stream.analytics.arn
    role_arn           = aws_iam_role.kinesis_firehose.arn
  }

  extended_s3_configuration {
    cloudwatch_logging_options {
      log_group_name  = "/aws/lambda/tylernorlund_cloudfront_analytics"
      log_stream_name = "tylernorlund_cloudfront_analytics"
      enabled         = true
    }
    role_arn   = aws_iam_role.firehose_role.arn
    bucket_arn = aws_s3_bucket.bucket.arn
  }
}

resource "aws_s3_bucket" "bucket" {
  bucket = "tylernorlund-cloudfront-analytics"
  acl    = "private"
}

resource "aws_iam_role" "firehose_role" {
  name = "firehose_cloudfront"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
data "aws_iam_policy_document" "kinesis_firehose_s3" {
  statement {
    effect = "Allow"
    actions = [
      "s3:AbortMultipartUpload",
      "s3:GetBucketLocation",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:ListBucketMultipartUploads",
      "s3:PutObject",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
      "logs:CreateLogStream"
    ]
    resources = [
      aws_s3_bucket.bucket.arn,
      "${aws_s3_bucket.bucket.arn}/*",
      "arn:aws:logs:*:*:*"
    ]
    sid = "kinesisId"
  }
}
resource "aws_iam_role_policy" "kinesis_firehose_stream_s3" {
  policy = data.aws_iam_policy_document.kinesis_firehose_s3.json
  role   = aws_iam_role.firehose_role.id
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
    viewer_protocol_policy  = "redirect-to-https"
    compress                = true
    allowed_methods         = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id        = var.dev_domain_name
    min_ttl                 = 0
    default_ttl             = 86400
    max_ttl                 = 31536000
    realtime_log_config_arn = aws_cloudfront_realtime_log_config.analytics.arn

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