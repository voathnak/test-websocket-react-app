import datetime
import json
import os

import boto3
import jwt
from jwt import DecodeError

from utils.constant import Error
from utils.custom_types.message import OnlineUserResponse, TextMessageContent, MessageHistoryUpdate, MessageHistory
from utils.models.connection import Connection
from utils.models.message import Message
from utils.custom_types.rpc_request_schema.get_messages import GetMessagesRequest
from utils.models.user import UserModel
from utils.socket_utilities import response_error_message, APIGWSocketCore, \
    get_socket_client, send_message
from utils.utils import httpResponse

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['CONNECTION_TABLE_NAME'])


class ConfigurationService(APIGWSocketCore):
    def __init__(self, event):
        super(ConfigurationService, self).__init__(event)
        self.func_set = {
            "rpc": {
                "get-rooms": self.get_room,
                "get-connections": self.get_connection,
                "set-connection": self.set_connection,
                "get-messages": self.get_messages,
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

    def get_messages(self, request_data=None):
        """
        user try to get all message by specific room
        """
        print("👽👽 get_messages 👽👽")

        request = GetMessagesRequest(**request_data)

        message = Message()
        all_messages = message.search('roomId', request.roomId)
        print(f"🥸🥸👹👹 all_messages: {all_messages} 🥸🥸👹👹")

        message_contents = [TextMessageContent(**json.loads(ms.get('content')))
                            for ms in all_messages]
        socket_message = MessageHistoryUpdate(MessageHistory(message_contents))

        send_message(self.socket, socket_message, [self.requesterId])

    # notify other user
    def response_update_online_user(self):
        connection = Connection()
        all_connections = connection.list()
        for conn in all_connections:
            # not include self (sending connection) connections
            nic_self_connections = [c.get('connectionId') for c in all_connections
                                    if c.get('connectionId') != conn.get("connectionId")]
            self.send_message(nic_self_connections, conn.get("connectionId"))

    def send_message(self, data, to_connection_id):
        message = OnlineUserResponse(data)
        send_message(self.socket, message, [to_connection_id])

    def get_room(self, request_data=None):
        """
            browser sent a request to configuration service to get all the rooms available to them
            this function will send back to only connections of the requested user
        """

        connection = Connection()
        all_connections = connection.list()
        all_connection_ids = [c.get("connectionId") for c in all_connections]
        self.send_health_check(all_connection_ids)
        pre_existing_rooms = [
            {'name': '#sellers'},
            {'name': '#with_sellers'},
        ]
        now = datetime.datetime.now()
        logging_in_user = self.decode_token(request_data) or {
            'username': f'nobody_{now.strftime("%y%m%d_%H%M%S_%f")}',
            'roles': []
        }

        self.set_connection(logging_in_user.get("username"))

        user = UserModel()
        user_list = user.list()

        for conn in all_connections:
            # not include self (sending connection) connections
            # nic_self_connections = [c.get('connectionId') for c in all_connections if c.get('connectionId') != conn.get("connectionId")]
            self.send_message(pre_existing_rooms, self.requesterId)

    def get_connection(self, request_data=None):
        """
        user completely login
        """

        connection = Connection()
        all_connections = connection.list()

        all_connection_ids = [c.get("connectionId") for c in all_connections]
        self.send_health_check(all_connection_ids)

        logged_user = self.decode_token(request_data)
        if not logged_user:
            return

        for conn in all_connections:
            # not include self (sending connection) connections
            nic_self_connections = [c for c in all_connections if c.get('connectionId') != conn.get("connectionId")]
            self.send_message(nic_self_connections, conn.get("connectionId"))

    def set_connection(self, username):
        connection = Connection()
        connection.update(self.requesterId, {"username": username})
        return True

    def controller(self):
        body_data = json.loads(self.event.get("body"))
        data = json.loads(body_data.get("data"))
        request_type, request_name, request_data = data.get("type"), data.get("name"), data.get("data")

        try:
            if request_type in self.func_set:
                if request_name in self.func_set.get(request_type, {}):
                    self.func_set[request_type][request_name](request_data)
                else:
                    self.response_error_message(Error.IntegrationError.rpcFunctionNotFound)
            else:
                self.response_error_message(Error.IntegrationError.invalidRequestType)
        except Exception as e:
            print("An exception occurred", e)
            self.response_error_message(Error.ServerError.internalServerError, e)

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
