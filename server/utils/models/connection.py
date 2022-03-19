import os

from marshmallow import fields

from utils.orm.model import Model


class Connection(Model):
    _fixed_name = os.environ.get('CONNECTION_TABLE_NAME')
    _primary_key = "connectionId"
    
    connectionId = fields.Str(required=True)
    username = fields.Str(required=False)

    def __init__(self):
        super(Connection, self).__init__()
