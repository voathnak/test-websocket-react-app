source .scripts/config.sh
PROJECT_DIR='/Users/vlim/Research/poc/chatApp'
cd terraform && AUTH_API=$(terraform output rootAPI) && cd - || exit
cd terraform && WEB_BUCKET_NAME=$(terraform output web_bucket_name | sed -e 's+^"++' -e 's+"$++') && cd - || exit

ENV_FILE_PATH="$PROJECT_DIR/webts/.env"

sed -i '' -e "s+REACT_APP_AUTH_URL.*+REACT_APP_AUTH_URL=${AUTH_API}+" $ENV_FILE_PATH
cd ../webts && yarn build && cd -

aws s3   --profile "$PROFILE" \
    --region "$REGION" \
    sync ../webts/build "s3://$WEB_BUCKET_NAME"