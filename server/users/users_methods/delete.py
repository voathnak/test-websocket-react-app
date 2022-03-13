import os

from utils.models.user import UserModel
from utils.orm import response


def delete_user(event, context):
    user = UserModel()
    record_id = event.get('pathParameters').get('id')
    user.delete(record_id)

    # create a response
    return response(204)
