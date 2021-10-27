const AWS = require('aws-sdk');
const { httpInternalServerError, httpOk } = require('utils/helpers');
const jwt = require('jsonwebtoken');
const { broadcast, broadcastError } = require('./broadcast');
const { getGameData } = require('./getGamData');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

const { TABLE_NAME: TableName } = process.env;

const decodedToken = (apiKey) => jwt.verify(
  apiKey, process.env.TOKEN_SECRET, (error, decoded) => decoded,
);

exports.handler = async (event) => {
  const {
    body: requestBody,
    requestContext: {
      domainName, stage, connectionId: thisConnectionId, identity: { sourceIp },
    },
  } = event;

  let connectionData;

  // Use this when you wanna send the confidential data
  const signedConnectionsParam = {
    TableName,
    FilterExpression: 'attribute_exists(#userId)',
    ExpressionAttributeNames: { '#userId': 'userId' },
  };

  const allConnectionsParam = { TableName: TableName, ProjectionExpression: 'connectionId' };

  try {
    connectionData = await ddb.scan(allConnectionsParam).promise();
    // connectionData = await ddb.scan(signedConnectionsParam).promise();
  } catch (e) {
    return httpInternalServerError(e.stack);
  }

  const connectionIds = connectionData.Items.map((x) => x.connectionId);

  const gateway = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29', endpoint: `${domainName}/${stage}`,
  });

  let bodyData;

  try {
    bodyData = JSON.parse(requestBody);
  } catch (e) {
    return httpInternalServerError(e.stack);
  }

  const { requestType, apiKey } = bodyData;
  const loggedInUser = decodedToken(apiKey);

  let postCalls = [];
  let data = {};

  // if (!loggedInUser) {
  if (loggedInUser) {
    postCalls = broadcastError(gateway, thisConnectionId, 'Invalid apiKey');
  } else {
    switch (requestType) {
      case 'mirror':
        data = bodyData.data;
        postCalls = broadcast(ddb, TableName, gateway, thisConnectionId, [thisConnectionId], data);
        break;
      case 'get_connections':
        data = bodyData.data;
        postCalls = broadcast(ddb, TableName, gateway, thisConnectionId, [thisConnectionId],
          connectionIds, 'get_connections');
        break;
      case 'hello-world':
        data = bodyData.data;
        postCalls = broadcast(ddb, TableName, gateway, thisConnectionId, connectionIds,
          { message: 'Hello World' });
        break;
      case 'broadcast':
        data = bodyData.data;
        postCalls = broadcast(ddb, TableName, gateway, thisConnectionId, connectionIds, data);
        break;
      case 'getGameData':
        data = getGameData();
        postCalls = broadcast(ddb, TableName, gateway, thisConnectionId, [thisConnectionId], data);
        break;
      default:
        postCalls = broadcast(ddb, TableName, gateway, thisConnectionId, [thisConnectionId],
          { message: `requestType: ${requestType} is not defined.` });
    }
  }

  try {
    await Promise.all(await postCalls);
  } catch (e) {
    return httpInternalServerError(e.stack);
  }
  return httpOk('Data sent.');
};
