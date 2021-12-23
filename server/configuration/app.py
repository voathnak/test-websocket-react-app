import json
import os

import jwt

from jwt import DecodeError
from utils.constant import MessageType, Error
from utils.models.connection import Connection
from utils.utils import log_event, httpResponse
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['CONNECTION_TABLE_NAME'])
SECRET_KEY = os.environ['SECRET_KEY']


def send_health_check(client, connection_ids):
    message_data = json.dumps({
        "type": MessageType.healthCheck,
    })

    for connection_id in connection_ids:
        try:
            client.post_to_connection(Data=message_data, ConnectionId=connection_id)
        except client.exceptions.GoneException:
            print("Deleting gone connection:", connection_id)
            table.delete_item(Key={'connectionId': connection_id})
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


def response_error_message(client, error, connection_id):
    message_data = json.dumps({
        "type": "error",
        "code": error.code,
        "message": error.message,
        "desc": f"error with code: {error.code} >> {error.message}"
    })
    print("#" * 5, f"<responded_error> code: {error.code} message: {str(error.message)} connection_id: {connection_id}")
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


def get_connection(socket_api, reqctx, request_data=None):
    requester_id = reqctx.get("connectionId")
    all_connection_ids = get_all_connection_ids()
    send_health_check(socket_api, all_connection_ids)

    if not set_connection(socket_api, reqctx, request_data):
        return

    all_connection_ids = get_all_connection_ids()
    for connection_id in all_connection_ids:
        send_message(socket_api, [c for c in all_connection_ids if c != requester_id], connection_id)


def set_connection(socket_api, reqctx, request_data=None):
    requester_id = reqctx.get("connectionId")
    print("$"*100)
    print(" request_data:", request_data)
    token = request_data.get("token")

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        print("decoded:", decoded)
        connection = Connection()
        connection.update(requester_id, {"username": decoded.get("username")})
        return True
    except DecodeError:
        print("ERROR DecodeError")
        response_error_message(socket_api, Error.ClientError.invalidToken, requester_id)
        return False
    except Exception as e:
        print("ERROR", e)
        print("ERROR DecodeError")
        response_error_message(socket_api, Error.ClientError.invalidToken, requester_id)
        return False


    print(" token:", token)
    decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    print("decoded:", decoded)

    connection = Connection()
    connection.update(requester_id, {"username": decoded.get("username")})
    print("$"*100)


def handler(event, context):
    log_event(event)
    reqctx = event.get('requestContext')
    socket_api = get_socket_client(event)

    body_data = json.loads(event.get("body"))

    func_set = {
        "rpc": {
            "get-connections": get_connection,
            "set-connection": set_connection,
        }
    }
    data = json.loads(body_data.get("data"))
    request_type, request_name, request_data = data.get("type"), data.get("name"), data.get("data")

    try:
        func_set.get(request_type).get(request_name)(socket_api, reqctx, request_data)

        # for connection_id in other_connection_ids:
        #     # send_message(socket_api, "Hello dear!", connection_id)
        #     send_message(socket_api, body_data.get("data"), connection_id)
    except Exception as e:
        print("An exception occurred", e)

    return httpResponse(200, "Data sent.")
