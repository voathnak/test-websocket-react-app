import json
import os
import uuid


from utils.presigned_url import create_presigned_post
from utils.utils import log_event, response


def get_upload_url(event, context):
    log_event(event)

    image_sizes = json.loads(os.environ.get('IMAGE_SIZES', "{}"))

    def pre_signed_post(file_name):
        object_name = "original/{}.{}".format(str(uuid.uuid1()), file_name.split(".")[-1].lower())
        return create_presigned_post(bucket_name, object_name)

    bucket_name = os.environ['IMAGE_BUCKET_NAME']
    bucket_domain_name = os.environ['IMAGE_BUCKET_DOMAIN']
    print("#"*50)
    print("bucket_name:", bucket_name)
    data = json.loads(event.get('body'))

    upload_url_data = [pre_signed_post(item.get("file_name")) for item in data]

    return response(200, {
        "bucketDomainName": bucket_domain_name,
        "imageSizes": [size.get("key") for size in image_sizes],
        "urls": upload_url_data
    })

