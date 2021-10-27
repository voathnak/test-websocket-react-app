#!/usr/bin/env bash

source .scripts/config.sh

#aws --profile "$PROFILE" --region "$REGION"  apigateway get-gateway-response --rest-api-id "$REST_API_ID" --response-type UNAUTHORIZED --generate-cli-skeleton
#aws --profile "$PROFILE" --region "$REGION"  apigateway get-gateway-response --rest-api-id "$REST_API_ID" --response-type MISSING_AUTHENTICATION_TOKEN

aws --profile "$PROFILE" --region "$REGION"  apigateway get-gateway-responses --rest-api-id "$REST_API_ID"
