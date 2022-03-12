import json


class BaseType:
    def __init__(self):
        pass

    def __iter__(self):
        for name, attr in self.__dict__.items():
            yield name, attr

    def json(self):
        return json.dumps(self, default=lambda o: o.__dict__, indent=4, sort_keys=True)

