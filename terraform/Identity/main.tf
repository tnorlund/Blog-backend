# Identity
#
#
#
# Both the API Gateway and SES require a certificate from Route 53.
resource "aws_ses_domain_identity" "identity" {
  domain = "tylernorlund.com"
}
data "aws_route53_zone" "blog" {
  name = "tylernorlund.com"
}

# Create the REST API
resource "aws_api_gateway_rest_api" "main" {
  name = var.api_name
}


# Cognito
resource "aws_cognito_user_pool" "main" {
  name = "${var.user_pool_name}_${var.stage}"
  alias_attributes = ["email", "preferred_username"]
  schema {
    attribute_data_type = "String"
    mutable             = true
    name                = "name"
    required            = true
  }
  schema {
    attribute_data_type = "String"
    mutable             = true
    name                = "email"
    required            = true
  }

  password_policy {
    minimum_length    = "8"
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  mfa_configuration        = "OFF"
  verification_message_template {
    default_email_option  = "CONFIRM_WITH_LINK"
    email_message_by_link = "Your life will be dramatically improved by signing up! {##Click Here##}"
    email_subject_by_link = "Welcome to to a new world and life!"
  }
  email_configuration {
    reply_to_email_address = "a-email-for-people-to@reply.to"
  }
  device_configuration {
    challenge_required_on_new_device      = true
    device_only_remembered_on_user_prompt = true
  }
}

 resource "aws_cognito_user_pool_client" "client" {
    name                = "client"
    user_pool_id        = aws_cognito_user_pool.main.id
    generate_secret     = true
    explicit_auth_flows = ["ADMIN_NO_SRP_AUTH"]
 }

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.identity_pool_name}_${var.stage}"
  allow_unauthenticated_identities = true

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.client.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = true
  }
 }

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated   = aws_iam_role.auth.arn
    unauthenticated = aws_iam_role.unauth.arn
  }
}

data "aws_iam_policy_document" "auth_policy" {
  statement {
    effect="Allow"
    actions = [
      "firehose:ListDeliveryStreams",
      "firehose:PutRecord",
      "firehose:PutRecordBatch",
      "execute-api:Invoke",
      "execute-api:ManageConnections",
      "execute-api:InvalidateCache"
    ]
    resources = [
      var.firehose_arn,
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/GET/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/POST/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/DELETE/*"
    ]
    sid = "authCommitId"
  }
}
resource "aws_iam_role" "auth" {
   name = "auth_role"

   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      }
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "auth" {
  policy = data.aws_iam_policy_document.auth_policy.json
  role   = aws_iam_role.auth.id
}

data "aws_iam_policy_document" "unauth_policy" {
  statement {
    effect="Allow"
    actions = [
      "firehose:ListDeliveryStreams",
      "firehose:PutRecord",
      "firehose:PutRecordBatch",
      "execute-api:Invoke",
      "execute-api:ManageConnections",
      "execute-api:InvalidateCache"
    ]
    resources = [
      var.firehose_arn,
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/GET/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/POST/*",
      "${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/DELETE/*"
    ]
    sid = "unauthCommitId"
  }
}
resource "aws_iam_role" "unauth" {
   name = "unauth_role"

   assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      }
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "unauth" {
  policy = data.aws_iam_policy_document.unauth_policy.json
  role   = aws_iam_role.unauth.id
}

#  resource "aws_iam_role" "auth_iam_role" {
#       name = "auth_iam_role"
#       assume_role_policy = <<EOF
#  {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Sid": "",
#       "Effect": "Allow",
#       "Action": [
#         firehose:ListDeliveryStreams,
#         firehose:PutRecord,
#         firehose:PutRecordBatch,
#         execute-api:Invoke,
#         execute-api:ManageConnections,
#         execute-api:InvalidateCache
#       ],
#       "Resource": [
#         ${var.firehose_arn},
#         ${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/GET/*,
#         ${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/POST/*,
#         ${aws_api_gateway_rest_api.main.execution_arn}/${var.stage}/DELETE/*
#       ],
#       "Principal": {
#         "Federated": "cognito-identity.amazonaws.com"
#       }
#     }
#   ]
#  }
#  EOF
#  }

# resource "aws_iam_role" "unauth_iam_role" {
#   name = "unauth_iam_role"
#   assume_role_policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Action": "sts:AssumeRole",
#       "Principal": {
#         "Federated": "cognito-identity.amazonaws.com"
#       },
#       "Effect": "Allow",
#       "Sid": ""
#     }
#   ]
# }
# EOF
# }

# resource "aws_iam_role_policy" "web_iam_unauth_role_policy" {
#     name = "web_iam_unauth_role_policy"
#     role = aws_iam_role.unauth_iam_role.id
#     policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Sid": "",
#       "Action": "*",
#       "Effect": "Deny",
#       "Resource": "*"
#     }
#   ]
# }
# EOF
# }