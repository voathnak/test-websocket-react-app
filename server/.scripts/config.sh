#!/usr/bin/env bash
# shellcheck disable=SC2034

APP_NAME="vlim-ws-chat"
STAGE_NAME="uat"
VERSION_NAME="i"
S3_BUCKET="$APP_NAME-$STAGE_NAME-$VERSION_NAME-bucket"
STACK_NAME="$APP_NAME-$STAGE_NAME-$VERSION_NAME-stack"
PROFILE="private-vlim"
REGION="ap-southeast-1"
INPUT_FILE="template.yaml"
OUTPUT_FILE="packaged.yaml"
CONNECTION_TABLE_NAME="$APP_NAME-$STAGE_NAME-conns-table"
FRONTEND_S3_BUCKET=uat.kohtnam.admin.vlim.co