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


class UserModel(RestModel):
    _fixed_name = os.environ.get('USER_TABLE_NAME')
    _name = "users"
    _primary_key = "username"
    email = fields.Str()
    name = fields.Str(required=True)
    username = fields.Str(required=True)
    password = fields.Str(required=True, load_only=True)
    access = fields.Str(default="user")
    roles = fields.List(fields.String)
    photo_link = fields.Str()

    def __init__(self):
        super(UserModel, self).__init__()

    def rest_controller(self, event, context):
        http_method = event.get('httpMethod')
        path = re.sub(f".*{self._name}", "", event.get("requestContext").get("resourcePath").lower())

        if http_method == "POST":
            if path == "/login":
                return self.login(event)
            elif path == "/signup":
                return self.signup(event, context)
        elif http_method == "GET":
            if path == "/current":
                return self.get_user(event, context)
        return super(UserModel, self).rest_controller(event, context)

    def signup(self, event, context):
        data = json.loads(event.get('body'))
        user = self.get(data.get("username"))
        if user:
            return response(401, {'message': "Username already exist and cannot be updated."})
        else:
            return super(UserModel, self).pre_create(event, context)

    def login(self, event):
        data = json.loads(event.get('body'))
        user = self.get(data.get("username"))
        if user and user.password == data.get("password"):
            self.assign(dict(user))
            encoded_jwt = jwt.encode({
                "username": self.username,
                "id": self.id,
                "email": self.email,
                "access": self.access,
                "iat": datetime.utcnow().timestamp()
            }, SECRET_KEY, algorithm='HS256')

            return response(200, dict({
                "message": "Login successful",
                "username": self.username,
                "id": self.id,
                "email": self.email,
                "token": encoded_jwt.decode()
            }))
        else:
            return response(401, {'message': "Username or Password is invalid."})

    @auth
    def get_user(self, event, context):
        authorized_user = event.get('authorizer')
        user = self.get(authorized_user.get("username"))
        if user:
            self.assign(dict(user))

            return response(200, self)
        else:
            return response(401, {'message': "Username or Password is invalid."})

    # @validates("username")
    # def validate_unique_username(self, value):
    #     if self.get(value):
    #         print("Validation: on username", value)
    #         raise ValidationError("username already exist and cannot be updated.")

