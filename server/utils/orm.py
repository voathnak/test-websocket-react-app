# ##
import json
import re

from marshmallow import Schema, fields, ValidationError, post_load
from boto3.dynamodb.conditions import Key
import pymongo as pymongo
from bson import ObjectId
import decimal
import logging
import uuid
import os
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


logger = logging.getLogger()
logger.setLevel(logging.INFO)

table_prefix, is_using_local_dynamodb = os.environ.get("TABLE_PREFIX"), bool(int(os.environ['IS_USING_LOCAL_DYNAMODB']))
dynamodb = boto3.resource('dynamodb', endpoint_url='http://host.docker.internal:7878') if is_using_local_dynamodb else \
    boto3.resource('dynamodb')

if is_using_local_dynamodb:
    print("👽👽👽👽 is_using_local_dynamodb: {} 👽👽👽👽".format(is_using_local_dynamodb))
    print("🤠🤠🤠🤠 Testing with local DynamoDB 🤠🤠🤠🤠")


# connection_url = os.environ['MONGODB_URI']
# dbname = os.environ["DB_NAME"]
# client = pymongo.MongoClient(connection_url)
# db = client[dbname]


class CharField:
    def __init__(self, null):
        pass


class BooleanField:
    def __init__(self, null):
        pass


class Model(Schema):
    _required_fields = []
    _output_id = True
    _systems_fields = ['id', 'createdAt', 'updatedAt']

    active = fields.Boolean(default=True)

    def __init__(self):
        super().__init__()
        self._has_record = False
        self._required_fields = self.__getattribute__("_required_fields")
        self._error_response = None
        if self._fixed_name:
            self._table = dynamodb.Table(self._fixed_name)
        elif self._name:
            self._table = dynamodb.Table(f"{table_prefix}{self._name.capitalize()}Table")
        else:
            raise "_name or _fixed_name attribute is required"

        # self.schema = Schema.from_dict({k: v for [k, v] in self.__class__.__dict__.items() if k[:1] != "_"})

    def _fetch_error(self, e):
        logger.error("Getting specific record from {}".format(self._table.name))
        logger.error(e)
        raise

    def dict_datatype(self, dictionary):
        def _iterate(data):
            for key, attr in data.items():
                if isinstance(attr, decimal.Decimal):
                    attr = float(attr)
                elif isinstance(attr, dict):
                    attr = self.dict_datatype(attr)
                yield key, attr

        return dict(_iterate(dictionary))

    def assign(self, record_dict):
        return self._load(record_dict)

    def _load(self, record_dict):
        for key, value in record_dict.items():
            if key == self._primary_key:
                value = str(value)
            elif isinstance(value, decimal.Decimal):
                value = float(value)
            elif isinstance(value, dict):
                value = self.dict_datatype(value)
            self.__setattr__(key, value)

    def recorded(self, record):
        if record:
            self._has_record = True
            self._load(record)
            return self
        else:
            self._has_record = False
            return None

    def _from_dict(self, record_dict):
        record = self.__class__()
        record._load(record_dict)
        return record

    def create(self, values):
        timestamp = str(datetime.utcnow().timestamp())
        item = {
            'createdAt': timestamp,
            'updatedAt': timestamp,
            'active': True
        }

        if self._primary_key:
            item.update({self._primary_key: values.get(self._primary_key)})
        elif not values.get(self._primary_key, False):
            item.update({self._primary_key: str(uuid.uuid1())})

        item.update(values)

        self._has_record = True
        # write the record to the database
        try:
            creating_doc = self._table.put_item(Item=item)
            if creating_doc['ResponseMetadata']['HTTPStatusCode']:
                self.get(item.get(self._primary_key))
                return self

        except Exception as e:
            self._fetch_error(e)

    def get(self, key):
        try:
            record = self._table.get_item(Key={self._primary_key: key})
            return self.recorded(record.get('Item', []))

        except Exception as e:
            self._fetch_error(e)
            return response(400, {"message": e, "code": 1001})

    def list(self):
        try:
            records = self._table.scan().get('Items', [])
            if records:
                self._has_record = True
            return [self._from_dict(record) for record in records]

        except Exception as e:
            logger.error("Getting records from {}".format(self._table.name))
            logger.error(e)
            return response(400, {"message": e, "code": 1002})

    # def controller(self, event, context):
    #     http_method = event.get('httpMethod')
    #     path = re.sub(f".*{self._name}", "", event.get("requestContext").get("resourcePath").lower())
    #
    #     if http_method == "POST":
    #         if path == "/find":
    #             return self.find_field_with_value(event)
    #         return self.pre_create(event, context)
    #     elif http_method == "GET":
    #         if path == "/{id}":
    #             return self.pre_get(event, context)
    #         return self.pre_list()
    #     elif http_method == "DELETE":
    #         if path == "" or path == "/":
    #             return self.pre_delete_multi(event)
    #         elif path == "/{id}":
    #             return self.pre_delete(event, context)
    #     elif http_method == "PUT":
    #         if path == "/{id}":
    #             return self.pre_update(event, context)
    #
    #     return response(METHOD_NOT_ALLOWED, {"message": "Method not allowed", "code": 1003})

    def pre_create(self, event, context):
        try:
            data = self.loads(event['body'])
            # data = self.schema().loads(event['body'])
        except ValidationError as err:
            print(err.messages)
            print(err.valid_data)
            return response(400, {"message": err.messages, "code": 1011})
        except TypeError as te:
            return response(400, {'message': str(te), "code": 1012})
        except Exception as e:
            return response(400, {'message': str(e), "code": 1013})

        # write the todos to the database
        doc = self.create(data)

        # create a response
        return response(200, dict(doc))

    def pre_update(self, event, context):
        try:
            _id = event.get('pathParameters').get('id')
            data = self.loads(event['body'], partial=True)
            updated = self.update(_id, data)
            if updated is None:
                return response(404, {"message": "Record not found.", "code": 1041})
            return response(200, dict(updated))
        except ValidationError as err:
            print(err.messages)
            print(err.valid_data)
            return response(400, {"message": str(err.messages), "code": 1042})
        except TypeError as te:
            return response(400, {'message': str(te), "code": 1043})
        except Exception as e:
            return response(400, {'message': str(e), "code": 1044})

    def pre_delete(self, event, context):
        try:
            _id = event.get('pathParameters').get('id')
            deleted = self.delete(_id)
            if deleted is None:
                return response(404, {"message": "Record not found.", "code": 1051})
            return response(204)
        except ValidationError as err:
            print(err.messages)
            print(err.valid_data)
            return response(400, {"message": str(err.messages), "code": 1052})
        except TypeError as te:
            return response(400, {'message': str(te), "code": 1053})
        except Exception as e:
            return response(400, {'message': str(e), "code": 1054})

    def pre_delete_multi(self, event):
        try:
            data = json.loads(event['body'])
            ids = data.get('ids')
            self.delete(ids)
            # if result is None:
            #     return response(404, {"message": "Record not found.", "code": 1061})
            return response(204)
        except ValidationError as err:
            print(err.messages)
            print(err.valid_data)
            return response(400, {"message": str(err.messages), "code": 1062})
        except TypeError as te:
            return response(400, {'message': str(te), "code": 1063})
        except Exception as e:
            return response(400, {'message': str(e), "code": 1064})

    def pre_list(self):
        docs = self.list()
        return response(200, [dict(result) for result in docs], "list")

    def json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

    def projection_field(self):
        return [x for x in list(self.declared_fields.keys()) + self._systems_fields if
                x not in ["id"]]

    def find_field_with_value(self, event, projection=None):
        try:
            data = json.loads(event['body'])
            operator = data.get("operator", "eq")
            field_name, value = data.get("field_name"), data.get("value")
            query_set = {
                "eq": Key(field_name).eq(value),
                "contains": Key(field_name).begins_with(value),
                "custom": data.get("query")
            }
            projection_field = self.projection_field()
            projection_field.remove(field_name)
            expression_attribute_names = {"#k": field_name}
            expression_attribute_names.update({f"#{x}": x for x in projection_field})
            scan_kwargs = {
                'FilterExpression': query_set.get(operator),
                # 'ProjectionExpression': f"#k, active",
                'ProjectionExpression': f"#k, {', '.join([f'#{x}' for x in projection_field])}",
                'ExpressionAttributeNames': expression_attribute_names
            }
            if projection:
                scan_kwargs.update({'ProjectionExpression': f"#k, {', '.join(projection)}"})

            done = False
            start_key = None
            docs = []
            while not done:
                if start_key:
                    scan_kwargs['ExclusiveStartKey'] = start_key
                res = self._table.scan(**scan_kwargs)
                docs += res.get('Items', [])
                start_key = res.get('LastEvaluatedKey', None)
                done = start_key is None
            # docs = self._collection.find(query_set.get(operator))
            #
            # for r in docs:
            #     x = self._from_dict(r)
            #     lis.append(x)
            return response(200, docs)
            # return response(200, [self._from_dict(result) for result in docs])
        except ValidationError as err:
            print(err.messages)
            print(err.valid_data)
            return response(400, {"message": str(err.messages), "code": 1072})
        except TypeError as te:
            return response(400, {'message': str(te), "code": 1073})
        except Exception as e:
            return response(400, {'message': str(e), "code": 1074})

    def pre_get(self, event, context):
        try:
            _id = Schema.from_dict({'id': fields.Str(required=True)})().load(event.get('pathParameters')).get('id')
            doc = self.get(_id)
            if doc is None:
                return response(404, {"message": "Record not found.", "code": 1031})
            return response(200, dict(doc))
        except ValidationError as err:
            print(err.messages)
            print(err.valid_data)
            return response(400, {"message": str(err.messages), "code": 1032})
        except TypeError as te:
            return response(400, {'message': str(te), "code": 1033})
        except Exception as e:
            return response(400, {'message': str(e), "code": 1034})

    def get_one(self):
        try:
            record = self._collection.find_one()
            return self.recorded(record)
        except Exception as e:
            self._fetch_error(e)

    def update(self, pkey, values):
        try:
            item = self._table.get_item(Key={self._primary_key: pkey}).get('Item', [])

            if item:
                self._load(item)
                self._has_record = True
                changed = False
                values.update({'updatedAt': str(datetime.utcnow().timestamp())})
                update_expression = 'SET '
                expression_attribute_values = {}
                expression_attribute_names = {}
                for key, value in values.items():
                    if key != "_id" and key != 'createdAt':
                        if self.__getattribute__(key) != value:
                            changed = True
                            update_expression += "#{} = :{}, ".format(key[:-2], key)
                            expression_attribute_values[":{}".format(key)] = value
                            expression_attribute_names["#{}".format(key[:-2])] = key
                if changed:
                    updated_record = self._table.update_item(
                        Key={
                            self._primary_key: pkey
                        },
                        ConditionExpression=f'attribute_exists({self._primary_key})',
                        UpdateExpression=update_expression[:-2],
                        ExpressionAttributeValues=expression_attribute_values,
                        ExpressionAttributeNames=expression_attribute_names,
                        ReturnValues='ALL_NEW',
                    )
                    self._load(updated_record.get('Attributes'))
                    return updated_record.get('Attributes')
                return "No Changed"
            else:
                self._has_record = False
        except Exception as e:
            logger.error("Updating records from {}".format(self._table.name))
            logger.error(e)
            raise
        return self.get(pkey)

    def delete(self, _id):
        try:
            if isinstance(_id, str):
                self._table.delete_item(Key={self._primary_key: _id})
            elif isinstance(_id, list):
                with self._table.batch_writer() as batch:
                    for id in _id:
                        batch.delete_item(Key={self._primary_key: id})

        except Exception as e:
            logger.error("Deleting records from {}".format(self._table.name))
            logger.error(e)
            raise

        return True

    def __iter__(self):
        # filter out the field that's not declared by user (those are the field that belong to Schema class)
        iterations = {k: self.__dict__.get(k) for y in [list(self.declared_fields.keys()),
                                                        self._systems_fields] for k in y}
        for name, attr in iterations.items():
            yield name, attr

    def __setattr__(self, name, value):
        if (name == 'createdAt' or name == 'updatedAt') and is_float(value):
            self.__dict__[name] = datetime.fromtimestamp(float(value)).strftime("%b %d %Y %H:%M:%S")
        elif name == self._primary_key and self._output_id:
            self.id = str(value)
            self.__dict__[name] = value
        else:
            self.__dict__[name] = value

    def __bool__(self):
        return self._has_record

    def __getattribute__(self, *args, **kwargs):
        try:
            return super(Model, self).__getattribute__(*args, **kwargs)
        except AttributeError:
            if args[0] in [k for y in [list(self.declared_fields.keys()), self._systems_fields] for k in y]:
                return None
            else:
                return super(Model, self).__getattribute__(*args, **kwargs)


class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Model):
            return dict(obj)
        else:
            return super(CustomEncoder, self).default(obj)


def response(status_code, body=None, type=None):
    if type == 'list':
        body = {
            "total": len(body),
            "success": True,
            "pageSize": len(body),
            "current": 1,
            "data": body
        }
    return {
        'statusCode': status_code,
        'body': json.dumps(body, cls=CustomEncoder),
        "headers": {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True,
        }
    }


def is_float(value):
    try:
        test = float(value)
        return isinstance(test, float)
    except ValueError:
        return False