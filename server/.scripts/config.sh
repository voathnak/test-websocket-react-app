#!/usr/bin/env bash
# shellcheck disable=SC2034

APP_NAME="vlim-ws-chatii"
STAGE_NAME="dev-i"
VERSION_NAME="iii"
S3_BUCKET="$APP_NAME-$STAGE_NAME-$VERSION_NAME-bucket"
STACK_NAME="$APP_NAME-$STAGE_NAME-$VERSION_NAME-stack"
PROFILE="aws1-vlim"
REGION="ap-southeast-1"
INPUT_FILE="template.yaml"
OUTPUT_FILE="packaged.yaml"
CONNECTION_TABLE_NAME="$APP_NAME-$STAGE_NAME-conns-table"
USER_MESSAGE_TABLE_NAME="vlim-ws-chat-dev-user-messages-dynamodb"