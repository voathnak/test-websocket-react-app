import os

import boto3

from utils.utils import log_event, httpResponse

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['CONNECTION_TABLE_NAME'])


def handler(event, context):
    log_event(event)
    reqctx = event.get('requestContext')
    self_id = reqctx.get("connectionId")
    try:
        table.delete_item(Key={'connectionId': self_id})
    except Exception as e:
        return httpResponse(500, f"Failed to disconnect: {e}")
    return httpResponse(200, "Disconnected.")
