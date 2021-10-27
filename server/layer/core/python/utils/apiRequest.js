const request = require('request-promise');

const postRequest = async (uri, body) => {
  console.info('Requesting data');
  const payload = {
    method: 'POST',
    json: true,
    uri,
    body,
  };
  const result = await request(payload);
  console.info('Request Result', JSON.stringify(result));
  return result;
};

const getRequest = async (uri) => {
  console.info('Requesting data');
  const payload = { method: 'GET', uri, json: true };
  const result = await request(payload);
  console.info('Request Result', JSON.stringify(result));
  return result;
};

module.exports = {
  GET: getRequest,
  POST: postRequest,
};
