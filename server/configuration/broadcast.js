const { StatusCodes } = require('http-status-codes');

/**
   * ddb: dynamoDB service
   * TableName: dynamoDB table name
   * gateway:
   * senderId: sender connection id
   * cons:
   * postData:
   * event:
 */
const broadcast = async (ddb, TableName, gateway, senderId, cons, postData, event = '') => cons.map(
  async (connectionId) => {
    try {
      return await gateway.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({
          senderId,
          event,
          data: postData,
        }),
      }).promise();
    } catch (e) {
      if (e.statusCode === StatusCodes.GONE) {
        console.info(`Found stale connection, deleting ${connectionId}`);
        await ddb
          .delete({ TableName, Key: { connectionId } })
          .promise();
      } else {
        throw e;
      }
      return false;
    }
  },
).filter(Boolean);

const broadcastError = async (gateway, senderId, errorMessage) => {
  try {
    return await gateway.postToConnection({
      ConnectionId: senderId,
      Data: JSON.stringify({
        event: 'error',
        data: {
          message: errorMessage,
        },
      }),
    }).promise();
  } catch (e) {
    console.error(e.stack);
    return false;
  }
};

module.exports = { broadcast, broadcastError };
