import json

from utils.models.user import UserModel
from utils.orm import response
from utils.utils import auth, log_event


def get_user(event, context):
    found_user = UserModel()
    record_id = event.get('pathParameters').get('id')
    found_user.get(record_id)

    # create a response
    if found_user:
        return response(200, dict(found_user))
    else:
        return response(204, "Record not found")


def logout(event, context):
    return response(200, json.dumps(dict({"data": {}, "success": True})))


@auth
def get_current_user(event, context):
    log_event(event)
    user_id = event.get("authorizer").get("id")
    user = UserModel()
    user.get(user_id)

    if user:
        return response(200, dict(user))
    else:
        return response(204, "User not found")
