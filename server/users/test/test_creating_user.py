import json
import os

os.environ['TABLE_PREFIX'] = ""
os.environ['STAGE_NAME'] = "dev"
os.environ['USER_TABLE_NAME'] = "vlim-ws-chat-dev-users-dynamodb"
os.environ['SECRET_KEY'] = "62fec8f63ccfeeb60149f4c49fbcda10"
os.environ['IS_USING_LOCAL_DYNAMODB'] = "1"

from users.handler import lambda_handler

file = open("./test.json")
test_json = json.load(file)

lambda_handler(test_json, {})
