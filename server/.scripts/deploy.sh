#!/usr/bin/env bash

source .scripts/config.sh
rm -rf .aws-sam

# Preparing Layer ######################################################################################
echo "✊ preparing layer..."
sh .scripts/layer-preparation.sh

# Create Buckets #######################################################################################
echo "🤞 creating bucket..."
aws s3api 	--profile "$PROFILE" create-bucket \
			--bucket "$S3_BUCKET" \
			--region "$REGION" \
			--create-bucket-configuration LocationConstraint="$REGION"


# Deploy Application ###################################################################################
rm -f packaged.yaml

echo "✌️ packaging..."

sam package --profile "$PROFILE" \
			--template-file "$INPUT_FILE" \
			--output-template-file "$OUTPUT_FILE" \
			--s3-bucket "$S3_BUCKET"

echo "🤟 deploying..."
sam deploy 	--profile "$PROFILE" \
			--region "$REGION" \
			--template-file "$OUTPUT_FILE" \
			--stack-name "$STACK_NAME" \
			--parameter-overrides \
				StageName="$STAGE_NAME" \
				DeploymentS3BucketName="$S3_BUCKET" \
				AppName="$APP_NAME" \
				ConnectionTableName="${CONNECTION_TABLE_NAME//-/_}" \
				UserMessageTableName="${USER_MESSAGE_TABLE_NAME}" \
				IsUsingLocalDynamodb="0" \
			--capabilities CAPABILITY_IAM

# Config Gateway Response ##############################################################################

#REST_API_ID=$(aws cloudformation describe-stacks \
#--profile "$PROFILE" \
#--region "$REGION" \
#--stack-name "$STACK_NAME" \
#--query "Stacks[0].Outputs[?OutputKey=='RestApiId'].OutputValue" \
#--output text)
#
#aws --profile "$PROFILE" --region "$REGION"  apigateway put-gateway-response \
#	--rest-api-id "$REST_API_ID" \
#	--response-type MISSING_AUTHENTICATION_TOKEN \
#	--status-code "404" \
#    --cli-input-json  file:///$(pwd)/scripts/gateway-response-json/missing_authentication_token.json
##
#aws --profile "$PROFILE" --region "$REGION"  apigateway put-gateway-response \
#	--rest-api-id "$REST_API_ID" \
#	--response-type DEFAULT_4XX \
#    --cli-input-json  file:///$(pwd)/scripts/gateway-response-json/default_4xx.json
##
#aws --profile "$PROFILE" --region "$REGION"  apigateway put-gateway-response \
#	--rest-api-id "$REST_API_ID" \
#	--response-type DEFAULT_5XX \
#    --cli-input-json  file:///$(pwd)/scripts/gateway-response-json/default_5xx.json

########################################################################################################

# shellcheck disable=SC2155
export API_GATEWAY_URL=$( \
aws cloudformation describe-stacks \
					--profile "$PROFILE" \
					--region "$REGION" \
					--stack-name "$STACK_NAME" \
					--query 'Stacks[0].Outputs[0].OutputValue' \
					--output text \
)

echo "API Gateway URL: $API_GATEWAY_URL"
