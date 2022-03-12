import datetime
import json
import os
from decimal import Decimal

import logging
from utils.constant import MessageType, Error
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


def handler(event, context):
    log_event(event)
    log_env(['CONNECTION_TABLE_NAME', 'SECRET_KEY', 'SOCKET_URL'])

    for record in event['Records']:
        print("#!@#"*6, "eventID: ", record['eventID'])
        print("#!@#"*6, "eventName: ", record['eventName'])
        print("#!@#"*6, "dynamodb: ", record['dynamodb'])

    return event
