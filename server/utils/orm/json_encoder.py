import decimal
import json

from utils.orm.model import Model


class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Model):
            return dict(obj)
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        else:
            return super(CustomEncoder, self).default(obj)