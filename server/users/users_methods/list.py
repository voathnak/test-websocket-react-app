import json
import os

from utils.models.user import UserModel
from utils.orm.rest_model import response


def list_users(event, context):
    # fetch all users from the database
    User = UserModel()
    users = User.list()

    # create a response
    return response(200, [dict(result) for result in users])
