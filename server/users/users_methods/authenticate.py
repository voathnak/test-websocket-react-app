import json
import os
import jwt

from datetime import datetime

from utils.models.user import UserModel
from utils.orm import response

SECRET_KEY = os.environ['SECRET_KEY']


def user_login(event, context):
    user_data = json.loads(event.get('body'))
    user_model = UserModel()
    users = [
        user for user in user_model.list()
        if user.username == user_data.get("username") and user.password == user_data.get("password")
    ]

    # create a response
    if users:
        user = users[0]
        encoded_jwt = jwt.encode({
            "username": user.username,
            "id": user.id,
            "access": user.access,
            "iat": datetime.utcnow().timestamp()
        }, SECRET_KEY, algorithm='HS256')

        return response(200, dict({
            "message": "Login successful",
            "username": user.username,
            "id": user.id,
            "email": user.email,
            "token": encoded_jwt.decode()
        }))
    else:
        return response(401, json.dumps({'message': "Username or Password is invalid."}))
