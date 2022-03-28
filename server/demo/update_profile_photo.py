import json
import os

import requests

from demo.constant import host
from demo.utils import login, get_presign_url, upload_image_to_s3

photo_image_dir = "/Users/vlim/Research/poc/chatApp/server/demo/static/img"

for filename in os.listdir(photo_image_dir):
    print("filename:", filename)

token = login('nak', '123456')
print("token: ", token)


def update_user_profile(photo_link, username):
    url = f"{host}/users/{username}"

    payload = json.dumps({
        "photo_link": photo_link
    })
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }

    response = requests.request("PUT", url, headers=headers, data=payload)

    print(response.text)


for file in [{"name": file, "path": os.path.join(root, file)} for root, dirs, files in os.walk(photo_image_dir)
             for file in files]:
    upload_fields_info = get_presign_url(file.get('name')).get('urls')[0]
    status = upload_image_to_s3(upload_fields_info, file)
    if status:
        photo_url = f"{upload_fields_info.get('url')}{upload_fields_info.get('fields').get('key').replace('original', '100x100')}"
        update_user_profile(photo_url, file.get('name').split('.')[0])
