import json
import os

from utils.constant import MessageType
from utils.utils import log_event, httpResponse
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])


def send_message(client, data, to_connection_id):
    message_data = json.dumps({
        "type": MessageType.onlineUser,
        "data": data,
        "desc": "online connections id"
    })
    print("#" * 5, "<send_message>", "message:", message_data, ", to_connection_id:", to_connection_id)
    try:
        client.post_to_connection(Data=message_data, ConnectionId=to_connection_id)
    except Exception as e:
        print("Error sending data to connection")
        print("Error detail:", e)


def get_all_connection_ids():
    scan_kwargs = {
        'ProjectionExpression': 'connectionId',
    }
    done = False
    start_key = None
    connections = []
    while not done:
        if start_key:
            scan_kwargs['ExclusiveStartKey'] = start_key
        response = table.scan(**scan_kwargs)
        connections.extend(response.get('Items', []))
        start_key = response.get('LastEvaluatedKey', None)
        done = start_key is None

    print("#" * 100)
    print("connections:", connections)
    print("#" * 100)

    return [c.get("connectionId") for c in connections]


def broadcast_new_joiner(reqctx):
    endpoint_url = 'https://{}/{}'.format(reqctx.get('domainName'), reqctx.get('stage'))
    socket_api = boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url)
    conn_ids = get_all_connection_ids()
    self_id = reqctx.get("connectionId")
    for connection_id in [c for c in conn_ids if c != self_id]:
        send_message(socket_api, [c for c in conn_ids if c != connection_id], connection_id)


def handler(event, context):
    log_event(event)
    reqctx = event.get('requestContext')
    self_id = reqctx.get("connectionId")
    table.put_item(Item={
      "connectionId": self_id
    })
    # broadcast_new_joiner(reqctx)
    return httpResponse(200, "Connected.")