import os
import json
import re
from datetime import datetime
import jwt
from marshmallow import fields, validates, ValidationError

from utils.orm.rest_model import RestModel, response
from utils.utils import auth

STAGE_NAME = os.environ.get('STAGE_NAME', '')
SECRET_KEY = os.environ.get('SECRET_KEY', '')


class ChatRoom(RestModel):
    _fixed_name = os.environ.get('ROOM_TABLE_NAME')
    _name = "room"
    _primary_key = "name"
    name = fields.Str(required=True)
    display_name = fields.Str(dump_only=True)
    usernames = fields.List(fields.String)

    def __init__(self):
        super(ChatRoom, self).__init__()
