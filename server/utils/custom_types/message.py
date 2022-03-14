from utils.custom_types.base import BaseType


class MessageContent(BaseType):
    pass


class TextMessageContent(MessageContent):
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


class SocketMessage(BaseType):
    messageType: str = ""
    content: TextMessageContent = {}

    def __init__(self, message_type: str, content: MessageContent.__class__):
        super().__init__()
        self.messageType = message_type
        self.content = content

    def __str__(self):
        return f" type: {self.messageType}, content: {self.content}"


class TextMessage(SocketMessage):
    def __init__(self, content: TextMessageContent):
        message_type = 'text-message'
        super().__init__(message_type, content)
