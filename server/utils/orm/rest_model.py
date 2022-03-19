import json
import logging
import re

from utils.constants.http_status_code import METHOD_NOT_ALLOWED
from utils.orm.json_encoder import CustomEncoder
from utils.orm.model import Model
from marshmallow import Schema, fields, ValidationError
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel(logging.INFO)


class RestModel(Model):

    def pre_create(self, event, context):
        try:
            data = self.loads(event['body'])
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

    def get(self, primary_key_value, sort_key_value=None):
        logger.info(f"[RestModel] Getting specific record from "
                    f"{self._table.name} with "
                    f"{self._primary_key} = {primary_key_value}")
        try:
            return super(RestModel, self).get(primary_key_value, sort_key_value)
        except Exception as e:
            self._fetch_error(e)
            return response(400, {"message": e, "code": 1001})

    def pre_list(self):
        docs = self.list()
        return self.response(200, docs)

    def list(self):
        try:
            return super(RestModel, self).list()

        except Exception as e:
            logger.error("Getting records from {}".format(self._table.name))
            logger.error(e)
            return response(400, {"message": e, "code": 1002})

    def pre_update(self, event, context):
        try:
            _id = event.get('pathParameters').get('id')
            data = self.loads(event['body'], partial=True)
            updated = super(RestModel, self).update(_id, data)
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
            deleted = super(RestModel, self).delete(_id)
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

    def rest_controller(self, event, context):
        http_method = event.get('httpMethod')
        path = re.sub(f".*{self._name}", "", event.get("requestContext").get("resourcePath").lower())

        if http_method == "POST":
            if path == "/find":
                return self.find_field_with_value(event)
            return self.pre_create(event, context)
        elif http_method == "GET":
            if path == "/{id}":
                return self.pre_get(event, context)
            return self.pre_list()
        elif http_method == "DELETE":
            if path == "" or path == "/":
                return self.pre_delete_multi(event)
            elif path == "/{id}":
                return self.pre_delete(event, context)
        elif http_method == "PUT":
            if path == "/{id}":
                return self.pre_update(event, context)

        return response(METHOD_NOT_ALLOWED, {"message": "Method not allowed", "code": 1003})

    def response(self, status_code, body=None):
        if isinstance(body, list):
            body = {
                "total": len(body),
                "success": True,
                "pageSize": len(body),
                "current": 1,
                "data": self.dump(body, many=True)
            }
        return {
            'statusCode': status_code,
            'body': json.dumps(body),
            "headers": {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True,
            }
        }


def response(status_code, body=None):
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


