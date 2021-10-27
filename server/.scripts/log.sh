#!/usr/bin/env bash

if [ $# -gt 0 ]; then
    echo "Your command line contains $# arguments: $1"
else
    echo "Your command line contains no arguments"
fi

source .scripts/config.sh
sam logs --profile "$PROFILE" -n $1 --stack-name "$STACK_NAME" --region "$REGION" --tail
