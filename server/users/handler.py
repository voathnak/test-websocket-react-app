from utils.models.user import UserModel
from utils.orm import response
from utils.utils import log_event, log_env


def lambda_handler(event, context):
    log_event(event)
    log_env(['TABLE_PREFIX', 'IS_USING_LOCAL_DYNAMODB', 'STAGE_NAME',
             'SECRET_KEY', 'USER_TABLE_NAME'])

    # return response(200, "Hello, Welcome to VLIM Users service")

    user = UserModel()
    return user.rest_controller(event, context)

