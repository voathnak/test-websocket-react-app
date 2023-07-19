class ErrorTemplate:
    def __init__(self, code, name, message):
        self.code = code
        self.name = name
        self.message = message


class Error:
    class ServerError:
        internalServerError = ErrorTemplate(5000, "Internal Server Error", "something when wrong in the server")

    class ClientError:
        invalidToken = ErrorTemplate(4100, "Invalid Token", "The token is invalid")

    class IntegrationError:
        rpcFunctionNotFound = ErrorTemplate(3404, "Invalid RPC function name", "Invalid RPC function name")
        invalidRequestType = ErrorTemplate(3405, "Invalid requestType/function name",
                                           "Invalid requestType/function name")



JAVASCRIPT_ISO_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%SZ"
