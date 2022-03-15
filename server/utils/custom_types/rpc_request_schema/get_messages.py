from utils.custom_types.base import BaseType


class GetMessagesRequest(BaseType):
    roomId: str = ""
    token: str = ""

    def __init__(self, room, token):
        super().__init__()
        self.roomId = room
        self.token = token
