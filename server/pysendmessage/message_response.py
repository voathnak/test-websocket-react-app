import json
import logging
import os

import boto3

from utils.custom_types.message import TextMessageContent, TextMessage
from utils.models.connection import Connection
from utils.socket_utilities import create_socket_client, \
    send_message
from utils.utils import log_event, log_env

dynamodb = boto3.resource('dynamodb')
conn_table = dynamodb.Table(os.environ.get('CONNECTION_TABLE_NAME', ""))
SECRET_KEY = os.environ.get('SECRET_KEY', "")
SOCKET_URL = os.environ.get('SOCKET_URL', "")

# Todo: update user on table update


LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)


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

        message_content = TextMessageContent(
            **json.loads(dynamodb.get('NewImage', {})
                         .get('content', {}).get('S', '{}')))
        message = TextMessage(message_content)
        print("#!@#"*6, "room: ", room)
        if room:
            connection = Connection()
            connections = [connection.search('username', username,
                                           projections=['connectionId'])
                         for username in room.split("-")]
            print("#!@#"*6, 'connections:', connections)
            socket = create_socket_client(SOCKET_URL)
            for conn in connections:
                send_message(socket, message, conn[0].get("connectionId"))
    return event
