import os

import boto3

aws_profile_name = os.environ.get("AWS_PROFILE_NAME", "")
region = os.environ.get("REGION", "")
is_using_local_dynamodb = bool(int(os.environ.get('IS_USING_LOCAL_DYNAMODB', 0)))


def create_dynamodb_resource():

    if aws_profile_name and region:
        print(f"👽👽👽👽 profile: {aws_profile_name}, region: {region} 👽👽👽👽")
        print("🤠🤠🤠🤠 Testing with cloud DynamoDB 🤠🤠🤠🤠")
        session = boto3.session.Session(profile_name=aws_profile_name)
        return session.resource("dynamodb", region)
    elif is_using_local_dynamodb:
        print("👽👽👽👽 is_using_local_dynamodb: {} 👽👽👽👽".format(is_using_local_dynamodb))
        print("🤠🤠🤠🤠 Testing with local DynamoDB 🤠🤠🤠🤠")
        return boto3.resource('dynamodb', endpoint_url='http://localhost:7878')
    return boto3.resource('dynamodb', region_name='ap-southeast-1')


def create_socket_client(endpoint_url):
    if aws_profile_name and region:
        session = boto3.session.Session(profile_name=aws_profile_name)
        return session.client('apigatewaymanagementapi', endpoint_url=endpoint_url)
    return boto3.client('apigatewaymanagementapi', endpoint_url=endpoint_url)
