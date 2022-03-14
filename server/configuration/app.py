import json
import os

import jwt

from jwt import DecodeError
from utils.custom_types.message import TextMessageContent
from utils.models.connection import Connection
from utils.socket_utilities import get_all_connections, get_all_connection_ids, response_error_message, APIGWSocketCore, \
    get_socket_client
from utils.utils import log_event, httpResponse
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['CONNECTION_TABLE_NAME'])
SECRET_KEY = os.environ['SECRET_KEY']


class ConfigurationService(APIGWSocketCore):
    def __init__(self, event):
        super(ConfigurationService, self).__init__(event)
        self.func_set = {
            "rpc": {
                "get-connections": self.get_connection,
                "set-connection": self.set_connection,
            }
        }

    # remove user socket timeout connection
    def send_health_check(self, connection_ids):
        message_data = json.dumps({
            "messageType": "health-check",
        })

        for connection_id in connection_ids:
            try:
                self.socket.post_to_connection(Data=message_data, ConnectionId=connection_id)
            except self.socket.exceptions.GoneException:
                print("Deleting gone connection:", connection_id)
                table.delete_item(Key={'connectionId': connection_id})
            except Exception as e:
                print("Error sending health check to connection")
                print("Error detail:", e)

        self.response_update_online_user()

    # notify other user
    def response_update_online_user(self):
        all_connections = get_all_connections(table)
        for conn in all_connections:
            # not include self connections
            nic_self_connections = [c for c in all_connections if c.get('connectionId') != conn.get("connectionId")]
            self.send_message(nic_self_connections, conn.get("connectionId"))

    def send_message(self, data, connection_id):
        message_data = json.dumps({
            "messageType": MessageType.onlineUser,
            "data": data,
            "desc": "online connections id"
        })
        print("#" * 5, "<send_message>", "message:", str(data), ", connection_id:", connection_id)
        self.socket.post_to_connection(Data=message_data, ConnectionId=connection_id)

    def get_connection(self, request_data=None):
        """
        user completely login
        """

        all_connection_ids = get_all_connection_ids(table)
        self.send_health_check(all_connection_ids)

        if not self.set_connection(request_data):
            return

        all_connections = get_all_connections(table)
        for conn in all_connections:
            # not include self connections
            nic_self_connections = [c for c in all_connections if c.get('connectionId') != conn.get("connectionId")]
            self.send_message(nic_self_connections, conn.get("connectionId"))

    def set_connection(self, request_data=None):
        print("$"*100)
        print(" request_data:", request_data)
        token = request_data.get("token")

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            print("decoded:", decoded)
            connection = Connection()
            connection.update(self.requesterId, {"username": decoded.get("username")})
            return True
        except DecodeError:
            print("ERROR DecodeError")
            self.response_error_message(Error.ClientError.invalidToken)
            return False
        except Exception as e:
            print("ERROR", e)
            print("ERROR DecodeError")
            self.response_error_message(Error.ClientError.invalidToken)
            return False

    def controller(self):
        body_data = json.loads(self.event.get("body"))
        data = json.loads(body_data.get("data"))
        request_type, request_name, request_data = data.get("type"), data.get("name"), data.get("data")

        try:
            self.func_set[request_type][request_name](request_data)
        except Exception as e:
            print("An exception occurred", e)
            self.response_error_message(Error.IntegrationError.rpcFunctionNotFound)

        return httpResponse(200, "Data sent.")


def handler(event, context):
    socket = get_socket_client(event)
    try:
        service = ConfigurationService(event)
        return service.controller()
    except Exception as e:
        print("An exception occurred", e)
        response_error_message(socket,
                               Error.ServerError.internalServerError,
                               event.get('requestContext').get("connectionId"))

    return httpResponse(200, "Data sent.")

