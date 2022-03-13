import json
import os

from utils.models.user import UserModel
from utils.orm import response


def update_user(event, context):
    user = UserModel()
    record_id = event.get('pathParameters').get('id')
    data = json.loads(event['body'])
    user.update(record_id, data)

    # create a response
    return response(200, dict(user))

