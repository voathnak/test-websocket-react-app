from utils.constant import MessageType
from utils.custom_types.base import BaseType


class MessageContent(BaseType):
    text: str = ""
    timestamp: str = ""
    sender: str = ""
    room: str = ""

    def __init__(self, text, timestamp, sender, room):
        super().__init__()
        self.text = text
        self.timestamp = timestamp
        self.sender = sender
        self.room = room

    def __str__(self):
        return f" text: {self.text}, " \
               f"room: {self.room}, " \
               f"sender: {self.sender}, " \
               f"timestamp: {self.timestamp}"


class Message(BaseType):
    messageType: str = ""
    content: MessageContent = {}

    def __init__(self, message_type, content: MessageContent):
        self.messageType = message_type
        self.content = content

    def __str__(self):
        return f" type: {self.messageType}, content: {self.content}"


class TextMessage(Message):

    def __init__(self, content: MessageContent):
        message_type = MessageType.message
        super().__init__(message_type, content)


