import datetime
import json
import os
from decimal import Decimal

import logging
from utils.constant import MessageType, Error
from utils.custom_types.message import MessageContent, TextMessage
from utils.models.connection import Connection
from utils.models.message import Message
from utils.socket_utilities import APIGWSocketCore, response_error_message, get_socket_client, create_socket_client
from utils.utils import log_event, httpResponse, log_env
import boto3

dynamodb = boto3.resource('dynamodb')
conn_table = dynamodb.Table(os.environ.get('CONNECTION_TABLE_NAME', ""))
SECRET_KEY = os.environ.get('SECRET_KEY', "")
SOCKET_URL = os.environ.get('SOCKET_URL', "")

# Todo: update user on table update


LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)


def send_message(client, content: MessageContent, to_connection_id):
    message = TextMessage(content)

    print("#" * 5, "<send_message>", "message:", message.json(),
          ", to_connection_id:", to_connection_id)
    try:
        client.post_to_connection(Data=message.json(),
                                  ConnectionId=to_connection_id)
    except Exception as e:
        print("Error sending data to connection")
        print("Error detail:", e)


def handler(event, context):
    log_event(event)
    log_env(['CONNECTION_TABLE_NAME', 'SECRET_KEY', 'SOCKET_URL'])

    for record in event['Records']:
        eventID, eventName, dynamodb = record.get('eventID', {}), \
                                       record.get('eventName', {}), \
                                       record.get('dynamodb', {})
        print("#!@#"*6, "eventID: ", eventID)
        print("#!@#"*6, "eventName: ", eventName)
        print("#!@#"*6, "dynamodb: ", dynamodb)
        print("#!@#"*6, "dynamodb JSON: ", json.dumps(dynamodb))
        room = json.loads(dynamodb.get('NewImage', {})
                          .get('content', {}).get('S', '{}')).get('room', False)

        message_content = MessageContent(
            **json.loads(dynamodb.get('NewImage', {})
                         .get('content', {}).get('S', '{}')))
        print("#!@#"*6, "room: ", room)
        if room:
            connection = Connection()
            connections = [connection.search('username', username,
                                           projections=['connectionId'])
                         for username in room.split("-")]
            print("#!@#"*6, 'connections:', connections)
            socket = create_socket_client(SOCKET_URL)
            for conn in connections:
                send_message(socket, message_content, conn[0].get("connectionId"))
    return event
