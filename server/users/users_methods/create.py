import json
import os

from utils.models.user import UserModel
from utils.orm import response


def create_user(event, context):
    values = json.loads(event.get('body'))

    user = UserModel()

    # write the user to the database
    values.update({"access": "admin"})
    user.create(values)
    # create a response
    if user:
        return response(201, [dict(user)])
    else:
        return user._error_response

