import json

import boto3
from utils.utils import log_event


def get_all_connection_ids(connection_table):
    scan_kwargs = {
        'ProjectionExpression': 'connectionId',
    }
    done = False
    start_key = None
    connections = []
    while not done:
        if start_key:
            scan_kwargs['ExclusiveStartKey'] = start_key
        response = connection_table.scan(**scan_kwargs)
        connections.extend(response.get('Items', []))
        start_key = response.get('LastEvaluatedKey', None)
        done = start_key is None

    print("#" * 100)
    print("connections:", connections)
    print("#" * 100)

    return [c.get("connectionId") for c in connections]


def get_all_connections(connection_table):
    scan_kwargs = {
        'ProjectionExpression': 'connectionId, username',
    }
    done = False
    start_key = None
    connections = []
    while not done:
        if start_key:
            scan_kwargs['ExclusiveStartKey'] = start_key
        response = connection_table.scan(**scan_kwargs)
        connections.extend(response.get('Items', []))
        start_key = response.get('LastEvaluatedKey', None)
        done = start_key is None

    return connections


def response_error_message(socket, error, requester_id):
    message_data = json.dumps({
        "messageType": "error",
        "code": error.code,
        "message": error.message,
        "desc": f"error with code: {error.code} >> {error.message}"
    })
    print("#" * 5,
          f"<responded_error> code: {error.code} message: {str(error.message)} connection_id: {requester_id}")
    socket.post_to_connection(Data=message_data, ConnectionId=requester_id)


def get_socket_client(event):
    context = event.get('requestContext')
    endpoint_url = 'https://{}/{}'.format(context.get('domainName'), context.get('stage'))
    return create_socket_client(endpoint_url)


def create_socket_client(endpoint_url):
    return boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url)


class APIGWSocketCore:
    def __init__(self, api_gateway_lambda_event):
        self.event = api_gateway_lambda_event
        log_event(self.event)
        self.context = self.event.get('requestContext')
        # self.requesterId = self.socket.get("connectionId")
        self.requesterId = self.context.get("connectionId")
        self.socket = self.get_socket_client()

    def get_socket_client(self):
        return get_socket_client(self.event)

    def response_error_message(self, error):
        response_error_message(self.socket, error, self.requesterId)
