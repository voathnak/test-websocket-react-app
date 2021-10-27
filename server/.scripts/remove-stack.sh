#!/usr/bin/env bash

source .scripts/config.sh
aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"
aws s3 rb s3://"$S3_BUCKET" --region "$REGION" --force