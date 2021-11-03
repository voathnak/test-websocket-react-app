import json

from utils.utils import log_event, httpResponse
import boto3

dynamodb = boto3.resource('dynamodb')


def send_message(client, message, connection_id):
    client.post_to_connection(Data=message, ConnectionId=connection_id)


def handler(event, context):
    table = dynamodb.Table('vlim_ws_chat_pydev_conns_table')
    log_event(event)
    http_method = event.get('httpMethod')
    path = event.get('path')
    print("method/path", http_method, path)
    scan_kwargs = {
        'ProjectionExpression': 'connectionId',
    }

    done = False
    start_key = None
    connection_ids = []
    while not done:
        if start_key:
            scan_kwargs['ExclusiveStartKey'] = start_key
        response = table.scan(**scan_kwargs)
        connection_ids.extend(response.get('Items', []))
        start_key = response.get('LastEvaluatedKey', None)
        done = start_key is None

    print("#"*100)
    print("connection_ids:", connection_ids)
    print("#"*100)
    body_data = json.loads(event.get("body"))

    endpoint_url = 'https://{}/{}'.format(event.get('domainName'), event.get('stage'))
    socket_api = boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url)

    for connection in connection_ids:
        # send_message(socket_api, "Hello dear!", connection.get("connectionId"))
        send_message(body_data.get("data"), connection.get("connectionId"))

    return httpResponse(200, "Data sent.")
