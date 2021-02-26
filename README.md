# Blog-backend

This repository contains the infrastructure as code for Tyler's blog. 

## How To Run
1. Run the setup script
```bash
% cd setup/
% bash setup.sh
```
2. Get your [Ipify](https://www.ipify.org) API key.
3. Run the terraform
```bash
% cd terraform
% terraform init
% terraform apply -var="ipify_key=<API_KEY>"
```

## What It Is
It uses Terraform to deploy the AWS services.

![terraform](https://tnorlundgithub.s3-us-west-2.amazonaws.com/terraform.png)

It also contains the Python and NodeJS code required for the lambda functions.

![lambda](https://tnorlundgithub.s3-us-west-2.amazonaws.com/lambda.png)