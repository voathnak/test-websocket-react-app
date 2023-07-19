# ##
import json

from marshmallow import Schema, fields, ValidationError
from boto3.dynamodb.conditions import Key
import decimal
import logging
import uuid
import os
from datetime import datetime
import boto3

from urllib.parse import unquote
from utils.boto_utils import create_dynamodb_resource
from utils.constant import JAVASCRIPT_ISO_DATETIME_FORMAT

logger = logging.getLogger()
logger.setLevel(logging.INFO)

table_prefix = os.environ.get("TABLE_PREFIX")

dynamodb = create_dynamodb_resource()


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
    _primary_key = False
    _sort_key = False

    active = fields.Boolean(default=True)

    createdAt = fields.DateTime(load_default=datetime.utcnow().isoformat())
    updatedAt = fields.DateTime(load_default=datetime.utcnow().isoformat())

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
        time_now = datetime.utcnow().isoformat()
        item = {
            'createdAt': time_now,
            'updatedAt': time_now,
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
                self.get(item.get(self._primary_key), item.get(self._sort_key, None))
                return self

        except Exception as e:
            self._fetch_error(e)

    def list(self):
        try:
            records = self._table.scan().get('Items', [])
            if records:
                self._has_record = True
            return self.load(records, many=True)

        except Exception as e:
            logger.error("Getting records from {}, code: {}".format(self._table.name, 1002))
            logger.error(e)

    def get(self, primary_key_value, sort_key_value=None):
        logger.info(f"[Model] Getting specific record from "
                    f"{self._table.name} with "
                    f"{self._primary_key} = {primary_key_value}")
        try:
            key = {self._primary_key: primary_key_value}
            if sort_key_value and self._sort_key:
                key.update({self._sort_key: sort_key_value})
            record = self._table.get_item(Key=key)

            return self.recorded(record.get('Item', []))

        except Exception as e:
            logger.error("[Model] Getting record from {}, code: {}".format(self._table.name, 1001))
            self._fetch_error(e)

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
                values.update({'updatedAt': datetime.utcnow().isoformat()})
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
                    return self._from_dict(updated_record.get('Attributes'))
                return "No Changed"
            else:
                self._has_record = False
        except Exception as e:
            logger.error("Updating records from {}".format(self._table.name))
            logger.error(e)
            raise
        return self.get(pkey)

    def delete(self, _id):
        _id = unquote(_id)
        try:
            logger.info(f"Deleting records with id: {_id} from table: {self._table.name}")
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

    def json(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

    def projection_field(self):
        return [x for x in list(self.declared_fields.keys()) if x not in ["id"]]

    def search(self, field_name, value, operator='eq', projections=None):
        if projections is None:
            projections = []
        try:
            query_set = {
                "eq": Key(field_name).eq(value),
                "contains": Key(field_name).begins_with(value),
            }
            projection_field = self.projection_field()
            projection_field.remove(field_name)
            expression_attribute_names = {"#k": field_name}

            if projections:
                projection_expression = f"#k, {', '.join([f'#{x}' for x in projections])}"
                expression_attribute_names.update({f"#{x}": x for x in projections})
            else:
                projection_expression = f"#k, {', '.join([f'#{x}' for x in projection_field])}"
                expression_attribute_names.update({f"#{x}": x for x in projection_field})


            scan_kwargs = {
                'FilterExpression': query_set.get(operator),
                # 'ProjectionExpression': f"#k, active",
                'ProjectionExpression': projection_expression,
                'ExpressionAttributeNames': expression_attribute_names
            }

            logger.info(f"scan_kwargs: {scan_kwargs}")

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
            return docs
        except ValidationError as err:
            print(err.messages)
            print(err.valid_data)
            print("Error 1082", err)
        except TypeError as te:
            print("Error 1083", te)
        except Exception as e:
            print("Error 1084", e)

    def __iter__(self):
        # filter out the field that's not declared by user (those are the field that belong to Schema class)
        iterations = {k: self.__dict__.get(k) for y in [list(self.declared_fields.keys()),
                                                        self._systems_fields] for k in y}
        for name, attr in iterations.items():
            yield name, attr

    def __setattr__(self, name, value):
        if (name == 'createdAt' or name == 'updatedAt') and is_float(value):
            self.__dict__[name] = datetime.fromtimestamp(float(value)).strftime(JAVASCRIPT_ISO_DATETIME_FORMAT)
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


def is_float(value):
    try:
        test = float(value)
        return isinstance(test, float)
    except ValueError:
        return False
