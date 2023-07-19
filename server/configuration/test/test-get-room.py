import json
import os
from unittest.mock import Mock


# os = Mock()
# os.environ.get('USER_TABLE_NAME').return_value = "vlim-ws-chat-dev-users-dynamodb"

os.environ['CONNECTION_TABLE_NAME'] = "vlim-ws-chat-dev-socket-connection-dynamodb"
os.environ['ROOM_TABLE_NAME'] = "vlim-ws-chat-dev-room-dynamodb"
os.environ['USER_MESSAGE_TABLE_NAME'] = "vlim-ws-chat-dev-user-messages-dynamodb"
os.environ['USER_TABLE_NAME'] = "vlim-ws-chat-dev-users-dynamodb"
os.environ['IS_USING_LOCAL_DYNAMODB'] = "0"
os.environ['SOCKET_URL'] = "https://7wkf4olvsa.execute-api.ap-southeast-1.amazonaws.com/dev"
os.environ['SECRET_KEY'] = "62fec8f63ccfeeb60149f4c49fbcda10"
os.environ['STAGE_NAME'] = "dev"
os.environ['AWS_PROFILE_NAME'] = "aws1-vlim"
os.environ['REGION'] = "ap-southeast-1"

from configuration.app import handler

file = open("./test-get-rooms.json")
test_json = json.load(file)

handler(test_json, {})
