import json
import os

import boto3
import uuid
from urllib.parse import unquote_plus
from PIL import Image

from utils.utils import log_event

s3_client = boto3.client('s3')
image_sizes = json.loads(os.environ.get('IMAGE_SIZES', "{}"))


def resize_image(image_path, resized_path, size):
    with Image.open(image_path) as image:
        image.thumbnail(size)
        image.save(resized_path)


def handler(event, context):
    print("#"*20)
    log_event(event)
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        tmpkey = key.replace('/', '')
        download_path = '/tmp/{}{}'.format(uuid.uuid4(), tmpkey)
        s3_client.download_file(bucket, key, download_path)
        for size in image_sizes:
            upload_path = '/tmp/resized-{}-{}'.format(size.get("key"), tmpkey)
            resize_image(download_path, upload_path, size.get("value"))
            s3_client.upload_file(upload_path, bucket, "{}/{}".format(size.get("key"), key.split('/')[-1]))
