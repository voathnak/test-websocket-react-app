// Copyright 2018-2020Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
	apiVersion: '2012-08-10',
	region: process.env.AWS_REGION,
});

const { TABLE_NAME } = process.env;

exports.handler = async (event) => {
	const {requestContext} = event;


	const apigwManagementApi = new AWS.ApiGatewayManagementApi({
		apiVersion: '2018-11-29',
		endpoint:
			requestContext.domainName + '/' + requestContext.stage,
	});

	const {action} = JSON.parse(event.body);

	const postCalls = [{ connectionId: requestContext.connectionId }].map(async ({ connectionId }) => {
		try {
			await apigwManagementApi
				.postToConnection({
					ConnectionId: connectionId,
					Data: `Action < ${action} > is not defined.`,
				})
				.promise();
		} catch (e) {
			if (e.statusCode === 410) {
				console.log(`Found stale connection, deleting ${connectionId}`);
				await ddb
					.delete({ TableName: TABLE_NAME, Key: { connectionId } })
					.promise();
			} else {
				throw e;
			}
		}
	});

	try {
		await Promise.all(postCalls);
	} catch (e) {
		return { statusCode: 500, body: e.stack };
	}

	return { statusCode: 200, body: 'Data sent.' };
};
