import json
import os
from typing import List

import boto3
import botocore
import jwt
from jwt import DecodeError

from utils.boto_utils import create_socket_client
from utils.constant import Error
from utils.custom_types.message import SocketMessage
from utils.models.connection import Connection
from utils.utils import log_event

SECRET_KEY = os.environ['SECRET_KEY']


def response_error_message(socket, error, requester_id, detail=""):
    message_data = json.dumps({
        "messageType": "error",
        "code": error.code,
        "message": error.message,
        "messageDetail": detail,
        "desc": f"error with code: {error.code} >> {error.message}"
    })
    print("#" * 5,
          f"<responded_error> code: {error.code} message: {str(error.message)} connection_id: {requester_id}")
    try:
        socket.post_to_connection(Data=message_data, ConnectionId=requester_id)
    except Exception as e:
        print(e)


def get_socket_client(event):
    context = event.get('requestContext')
    endpoint_url = 'https://{}/{}'.format(context.get('domainName'), context.get('stage'))
    return create_socket_client(endpoint_url)


def send_message(client, message: SocketMessage, to_connection_ids: List[str]):
    for to_connection_id in to_connection_ids:
        print("#" * 5, "<send_message>", "message:", message.json(),
              ", to_connection_id:", to_connection_id)
        try:
            client.post_to_connection(Data=message.json(),
                                      ConnectionId=to_connection_id)
        except Exception as e:
            print("Error sending data to connection")
            print("Error detail:", e)





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

    def response_error_message(self, error, detail=""):
        response_error_message(self.socket, error, self.requesterId, detail)

    def decode_token(self, request_data):
        print("$" * 100)
        print(" request_data:", request_data)
        token = request_data.get("token")

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            print("decoded:", decoded)
            username = decoded.get("username")
            roles = decoded.get("roles", [])
            return {'username': username, 'roles': roles}

        except DecodeError:
            print("ERROR DecodeError")
            self.response_error_message(Error.ClientError.invalidToken)
            return False

        except Exception as e:
            print("ERROR", e)
            print("ERROR DecodeError")
            self.response_error_message(Error.ClientError.invalidToken)
            return False
