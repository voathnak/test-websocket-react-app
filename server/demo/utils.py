import json
import mimetypes

import requests

from demo.constant import host


def login(username, password):
    payload = json.dumps({
        "username": username,
        "password": password
    })
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", f"{host}/users/login", headers=headers, data=payload)

    print(response.text)
    return json.loads(response.text).get('token')


def get_presign_url(filename):
    payload = json.dumps([
        {
            "file_name": filename
        }
    ])
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", f"{host}/preSignUrl", headers=headers, data=payload)

    response_data = json.loads(response.text)
    print(json.dumps(response_data, indent=2))

    return response_data


def upload_image_to_s3(presign_info, file):
    url = presign_info.get('url')

    payload = presign_info.get('fields')
    files = [('file', (
        file.get('name'),
        open(file.get('path'), 'rb'),
        mimetypes.MimeTypes().guess_type(file.get('path'))[0]
    ))]
    headers = {}

    response = requests.request("POST", url, headers=headers, data=payload, files=files)

    print(response.text)
    if response.status_code == 204:
        return True

    return False
