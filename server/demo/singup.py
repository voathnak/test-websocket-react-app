
import requests
import json

from demo.constant import users, host

for user in users:
    payload = json.dumps(user)
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", f"{host}/users/signup", headers=headers, data=payload)

    print(response.text)
