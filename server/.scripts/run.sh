#!/usr/bin/env bash

source .scripts/config.sh
rm -rf .aws-sam
sh .scripts/layer-preparation.sh
#sam build && \
sam local start-api --region "$REGION" \
  --profile "$PROFILE" --parameter-overrides \
				StageName="$STAGE_NAME" \
				DeploymentS3BucketName="$S3_BUCKET" \
				AppName="$APP_NAME" \
				TableName="${TABLE_NAME//-/_}" \
  --skip-pull-image --debug-port 5890 \
  2>&1 | tr "\r" "\n"
