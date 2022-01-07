# vlim-ws-chat-dev-user-messages-dynamodb
import os

from marshmallow import fields
from utils.orm import Model


class Message(Model):
    _fixed_name = os.environ.get('USER_MESSAGE_TABLE_NAME')
    _primary_key = "userId"
    _sort_key = "timestamp"

    userId = fields.Str(required=True)
    timestamp = fields.Decimal(required=True)
    content = fields.Str(required=True)

    def __init__(self):
        super(Message, self).__init__()
