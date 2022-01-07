#!/usr/bin/env bash
source .scripts/config.sh
sam logs --profile "$PROFILE" --stack-name "$STACK_NAME" --region "$REGION" --tail
