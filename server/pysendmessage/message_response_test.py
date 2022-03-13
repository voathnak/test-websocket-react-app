from pysendmessage.message_response import handler

event = {
    "Records": [
        {
            "eventID": "2cdfa9ad74ebdac471fb10cc13fdc92f",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "ap-southeast-1",
            "dynamodb": {
                "ApproximateCreationDateTime": 1647018842,
                "Keys": {
                    "userId": {
                        "S": "nak"
                    },
                    "timestamp": {
                        "N": "1647018842.1865940093994140625"
                    }
                },
                "NewImage": {
                    "createdAt": {
                        "N": "1647018842.1967489719390869140625"
                    },
                    "active": {
                        "BOOL": True
                    },
                    "userId": {
                        "S": "nak"
                    },
                    "content": {
                        "S": "{\"text\":\"nak: yeee!!!\",\"timestamp\":1647018840246,\"sender\":\"nak\",\"room\":\"lin-nak\"}"
                    },
                    "timestamp": {
                        "N": "1647018842.1865940093994140625"
                    },
                    "updatedAt": {
                        "N": "1647018842.1967489719390869140625"
                    }
                },
                "SequenceNumber": "25496000000000010764863641",
                "SizeBytes": 215,
                "StreamViewType": "NEW_AND_OLD_IMAGES"
            },
            "eventSourceARN": "arn:aws:dynamodb:ap-southeast-1:097947100355:table/vlim-ws-chat-dev-user-messages-dynamodb/stream/2022-03-06T08:35:18.098"
        }
    ]
}

handler(event, {})
