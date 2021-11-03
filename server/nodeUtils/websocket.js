const { httpInternalServerError, httpOk } = require('utils/helpers');

const broadcastCountUserToAllConnections = async (apigwManagementApi, TableName, ddb) => {
  const connectionData = await ddb.scan({
    TableName,
    ProjectionExpression: 'connectionId',
  }).promise();
  const onlineUserNumber = connectionData.Items.length;
  const payload = { statusCode: 200, date: new Date(), data: { onlineUserNumber } };
  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(payload),
      }).promise();
    } catch (e) {
      return httpInternalServerError({ message: e.stack });
    }
  });
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return httpInternalServerError({ message: e.stack });
  }
  return httpOk({ message: 'Data sent.' });
};

module.exports = { broadcastCountUserToAllConnections };
