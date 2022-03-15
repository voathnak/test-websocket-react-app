import json
import unittest

from utils.custom_types.rpc_request_schema.get_room_message import GetMessagesRequest


class TestGetMessagesRequest(unittest.TestCase):

    def test_model_init(self):
        a = {'token': "yyy", "room": "xxx"}
        b = {"roomId": "xxx", 'token': "yyy"}

        get_message_request = GetMessagesRequest(**a)
        assert get_message_request.json() == json.dumps(b, indent=4, sort_keys=True)


if __name__ == "__main__":
    unittest.main()
