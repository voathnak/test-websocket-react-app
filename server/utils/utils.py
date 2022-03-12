import datetime
import json
import os
import re
from functools import reduce

import jwt

from utils.orm import response

email_regex = '^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+([.]\w{2,10})+$'


class Destruct:
    def __init__(self, boby):
        self.body = boby

    def get(self, fields_list_string):
        return [self.body.get(f.strip()) for f in fields_list_string.split(',')]


def auth(func):
    def wrapper(self, event, context):
        SECRET_KEY = os.environ['SECRET_KEY']
        authorizer = event.get("requestContext").get("authorizer")
        local_authorizer_token = event.get("headers").get("Authorization", "").replace("Bearer ", "")
        if not authorizer:
            if not local_authorizer_token:
                return response(401, {'message': 'Token is Required'})
        try:
            authorizer = jwt.decode(local_authorizer_token, SECRET_KEY, algorithms=['HS256'])
            print("#"*15, "Insert authorizer into event before the function is called.", "#"*24)
            event.update( {"authorizer": authorizer})
        except Exception as e:
            print("#### Error: {}".format(e))
            return response(401, json.dumps({'message': 'Invalid Token'}))
        result = func(self, event, context)
        print("#"*100)
        return result

    return wrapper


def check_email(email):
    if re.search(email_regex, email):
        return True
    else:
        return False


def log_event(event):
    print(datetime.datetime.now())
    print("#" * 2, datetime.datetime.now(), "#"*70)
    event_json = json.dumps(event, indent=4, sort_keys=False)
    print("#---- event:", event_json)
    print("#" * 100)


def log_env(keys):
    print(datetime.datetime.now())
    print("#" * 2, datetime.datetime.now(), "#"*70)
    env_dict = dict((x, os.environ.get(x, "")) for x in keys)
    d_json = json.dumps(env_dict, indent=4, sort_keys=False)
    print(f"#---- ENV:", d_json)
    print("#" * 100)


def log_event_body(event):
    body = json.loads(event.get("body"))
    print("#" * 100)
    event_json = json.dumps(body, indent=4, sort_keys=False)
    print("#---- event-body:", event_json)
    print("#" * 100)


def httpResponse(status_code, body=None):
    return {
        'statusCode': status_code,
        'body': json.dumps(body),
        "headers": {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True,
        }
    }


class OdooServerConnection:
    def __init__(self, setting):
        self.status = 200
        self.fail_message = ""
        self.login_detail_keys = ['odoo_host', 'odoo_db', 'odoo_login', 'odoo_password']
        self.login_details = []

        if not setting:
            self.fail_message = "No primary account found"
            self.status = 403
        elif not reduce(lambda a, b: a * b, [x in setting for x in self.login_detail_keys]):
            self.status = 403
            self.fail_message = "Login details are required"
        else:
            self.login_details = [setting.get(detail) for detail in self.login_detail_keys]

    def __bool__(self):
        return self.status == 200
