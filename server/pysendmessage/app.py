import datetime
import json
import os
from decimal import Decimal

from utils.constant import MessageType, Error
from utils.custom_types.message import MessageContent
from utils.models.connection import Connection
from utils.models.message import Message
from utils.socket_utilities import APIGWSocketCore, response_error_message, get_socket_client
from utils.utils import log_event, httpResponse, log_env
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('CONNECTION_TABLE_NAME', ''))
SECRET_KEY = os.environ.get('SECRET_KEY', '')

# Todo: update user on table update


class MessagingService(APIGWSocketCore):
    def __init__(self, event):
        super(MessagingService, self).__init__(event)

    def controller(self):
        body_data = json.loads(self.event.get("body"))
        data = json.loads(body_data.get("data"))
        request_type, request_name, request_data = data.get("type"), data.get("name"), data.get("data")

        try:
            print("#--#"*40)
            # Todo: get userId from connection
            connection = Connection().get(self.requesterId)
            user_id = connection.username
            print(f"user_id: {user_id}")
            timestamp = Decimal(datetime.datetime.now().timestamp())
            print(f"timestamp: {timestamp}")
            content = json.loads(self.event.get("body")).get('data')
            print(f"content: {content}")
            print("#--#"*40)
            # Todo: save message
            message = Message()
            message_content = MessageContent(**json.loads(content))
            message.create({
                "roomId": message_content.room,
                "userId": connection.username,
                "timestamp": timestamp,
                "content": message_content.json()
            })
        except Exception as e:
            print(f"An exception occurred: <<{e}>>")
            self.response_error_message(Error.IntegrationError.rpcFunctionNotFound)

        return httpResponse(200, "Data sent.")


# ############## OLD ######################################

#
# def send_message(client, message, from_conn_id, to_conn_id):
#     message_data = {
#         "type": MessageType.message,
#         "data": message,
#         "from": from_conn_id,
#         "to": to_conn_id
#     }
#     client.post_to_connection(Data=json.dumps(message_data), ConnectionId=to_conn_id)

######################################

def handler(event, context):
    log_event(event)
    log_env(['CONNECTION_TABLE_NAME', 'SECRET_KEY'])
    try:
        service = MessagingService(event)
        return service.controller()
    except Exception as e:
        print("An exception occurred", e)
        socket = get_socket_client(event)
        response_error_message(socket,
                               Error.ServerError.internalServerError,
                               event.get('requestContext').get("connectionId"))

    return httpResponse(200, "Data sent.")

    # ############## OLD ######################################
    # table = dynamodb.Table(os.environ['CONNECTION_TABLE_NAME'])
    # log_event(event)
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    # reqctx = event.get('requestContext')
    #
    # scan_kwargs = {
    #     'ProjectionExpression': 'connectionId',
    # }
    #
    # done = False
    # start_key = None
    # connections = []
    # while not done:
    #     if start_key:
    #         scan_kwargs['ExclusiveStartKey'] = start_key
    #     response = table.scan(**scan_kwargs)
    #     connections.extend(response.get('Items', []))
    #     start_key = response.get('LastEvaluatedKey', None)
    #     done = start_key is None
    #
    # print("#" * 100)
    # print("connections:", connections)
    # print("#" * 100)
    #
    # body_data = json.loads(event.get("body"))
    #
    # endpoint_url = 'https://{}/{}'.format(reqctx.get('domainName'), reqctx.get('stage'))
    # socket_api = boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url)
    #
    # other_connection_ids = [c.get("connectionId") for c in connections
    #                         if c.get("connectionId") != reqctx.get("connectionId")]
    #
    # try:
    #     for connection_id in other_connection_ids:
    #         # send_message(socket_api, "Hello dear!", connection_id)
    #         send_message(socket_api, body_data.get("data"), reqctx.get("connectionId"), connection_id)
    # except Exception as e:
    #     print("An exception occurred", e)

    # return httpResponse(200, "Data sent.")
    ######################################
