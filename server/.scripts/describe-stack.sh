#!/usr/bin/env bash

source .scripts/config.sh

API_GATEWAY_URL=$( \
aws cloudformation describe-stacks \
					--profile "$PROFILE" \
					--region "$REGION" \
					--stack-name "$STACK_NAME" \
					--query 'Stacks[0].Outputs[0].OutputValue' \
					--output text \
)

echo "API Gateway URL: $API_GATEWAY_URL"

API_GATEWAY_SOCKET_URL=$( \
aws cloudformation describe-stacks \
          --profile "$PROFILE" \
          --region "$REGION" \
          --stack-name "$STACK_NAME" \
          --query "Stacks[0].Outputs[?OutputKey=='WebSocketURI'].OutputValue" \
          --output text \
)

echo "API_GATEWAY_SOCKET_URL: $API_GATEWAY_SOCKET_URL"
