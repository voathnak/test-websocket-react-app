import json

from pysendmessage.app import handler

event = {
    "requestContext": {
        "routeKey": "sendmessage",
        "messageId": "OrTuTcIYSQ0CGFA=",
        "eventType": "MESSAGE",
        "extendedRequestId": "OrTuTHIqSQ0Fg7A=",
        "requestTime": "08/Mar/2022:17:59:42 +0000",
        "messageDirection": "IN",
        "stage": "dev-i-vi",
        "connectedAt": 1646761472060,
        "requestTimeEpoch": 1646762382585,
        "identity": {
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36",
            "sourceIp": "110.235.247.218"
        },
        "requestId": "OrTuTHIqSQ0Fg7A=",
        "domainName": "uo89jo1heh.execute-api.ap-southeast-1.amazonaws.com",
        "connectionId": "OrRgCd28yQ0CGFA=",
        "apiId": "uo89jo1heh"
    },
    "body": "{\"data\":\"{\\\"text\\\":\\\"nak: hoooya\\\",\\\"id\\\":1646762382534,\\\"sender\\\":\\\"nak\\\",\\\"room\\\":\\\"nak-tino\\\"}\",\"action\":\"sendmessage\"}",
    "isBase64Encoded": False
}


handler(event, {})
