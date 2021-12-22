import json
import os

from utils.constant import MessageType
from utils.utils import log_event, httpResponse
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])


def send_health_check(client, connection_ids):
    message_data = json.dumps({
        "type": MessageType.healthCheck,
    })

    for connection_id in connection_ids:
        try:
            client.post_to_connection(Data=message_data, ConnectionId=connection_id)
        except client.exceptions.GoneException:
            print("Deleting gone connection:", connection_id)
            table.delete_item(Key=connection_id)
        except Exception as e:
            print("Error sending health check to connection")
            print("Error detail:", e)


def send_message(client, data, connection_id):
    message_data = json.dumps({
        "type": MessageType.onlineUser,
        "data": data,
        "desc": "online connections id"
    })
    print("#" * 5, "<send_message>", "message:", str(data), ", connection_id:", connection_id)
    client.post_to_connection(Data=message_data, ConnectionId=connection_id)


def get_socket_client(event):
    reqctx = event.get('requestContext')
    endpoint_url = 'https://{}/{}'.format(reqctx.get('domainName'), reqctx.get('stage'))
    return boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url)


def get_all_other_connection_id(self_connection_id):
    return [c for c in get_all_connection_ids() if c != self_connection_id]


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


def get_connection(socket_api, reqctx):
    requester_id = reqctx.get("connectionId")
    all_connection_ids = get_all_connection_ids()
    send_health_check(socket_api, all_connection_ids)
    all_connection_ids = get_all_connection_ids()
    for connection_id in all_connection_ids:
        send_message(socket_api, [c for c in all_connection_ids if c != requester_id], connection_id)


def handler(event, context):
    log_event(event)
    reqctx = event.get('requestContext')
    socket_api = get_socket_client(event)

    body_data = json.loads(event.get("body"))

    func_set = {
        "rpc": {
            "get-connections": get_connection
        }
    }
    data = json.loads(body_data.get("data"))
    request_type, request_name = data.get("type"), data.get("name")

    try:
        func_set.get(request_type).get(request_name)(socket_api, reqctx)

        # for connection_id in other_connection_ids:
        #     # send_message(socket_api, "Hello dear!", connection_id)
        #     send_message(socket_api, body_data.get("data"), connection_id)
    except Exception as e:
        print("An exception occurred", e)

    return httpResponse(200, "Data sent.")
