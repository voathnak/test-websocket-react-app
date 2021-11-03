const jwt = require('jsonwebtoken');
const moment = require('moment');
const validate = require('validate.js');

const parseBody = (body, constrain) => {
  try {
    validate.extend(validate.validators.datetime, {
      parse(value) {
        return +moment.utc(value);
      },
      format(value, options) {
        const format = options.dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm:ss';
        return moment.utc(value).format(format);
      },
    });

    // Validating the request body
    const requestBody = JSON.parse(body);

    const fieldValidation = validate(requestBody, constrain);
    if (fieldValidation) return { requestBody: false, error: fieldValidation };
    return { requestBody, error: false };
  } catch (e) {
    return { requestBody: false, error: e.toString() };
  }
};

const logEvent = (event) => {
  console.info('## event:', JSON.stringify(event, null, 2));
};

const getLoggedInUser = ({
  headers: { Authorization },
  requestContext: {
    domainName,
    authorizer,
  },
}) => {
  if (domainName === '127.0.0.1:4000' || domainName === 'localhost:4000') {
    const token = Authorization.replace('Bearer ', '');
    return jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
      if (error) {
        throw new Error('Invalid token!');
      } else {
        return decoded;
      }
    });
  }
  return JSON.parse(authorizer.user);
};

const calculateOffset = (page, perPage) => ((page === 1) ? 0 : perPage * (page - 1));

const toSnackCase = (str) => str.split(' ').map((ele) => ele.toLowerCase()).join('_');

const waitMillis = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const privateReplacer = (key, value) => {
  // Filtering out Private properties
  if (key && key !== '_id' && key[0] === '_') {
    return undefined;
  }
  return value;
};

const sortHelper = (params) => {
  let sort = {};
  if (params) {
    if (params.charAt(0) === '-') {
      sort[`${params.substring(1)}`] = -1;
    } else {
      sort[params] = 1;
    }
  } else {
    sort = { createdAt: -1 };
  }
  return sort;
};

const httpResponse = (status, body) => ({
  statusCode: status,
  headers: {
    'Access-Control-Allow-Headers':
      'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST, GET, PUT, PATCH, OPTIONS',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body, privateReplacer, 2),
});

const httpOk = (body) => httpResponse(200, body);
const httpCreated = (body) => httpResponse(201, body);
const httpBadRequest = (body) => httpResponse(400, body);
const httpUnauthorized = (body) => httpResponse(400, body);
const httpForbidden = (body) => httpResponse(403, body);
const httpMethodNotAllowed = (body) => httpResponse(405, body);
const httpMethodConflict = (body) => httpResponse(409, body);
const httpExpectationFailed = (body) => httpResponse(417, body);
const httpTooManyRequests = (body) => httpResponse(429, body);
const httpInternalServerError = (body) => httpResponse(500, body);
const httpNotImplemented = (body) => httpResponse(501, body);
const httpNotFound = (body) => httpResponse(404, body);

module.exports = {
  logEvent,
  parseBody,
  getLoggedInUser,
  privateReplacer,
  httpResponse,
  httpOk,
  httpCreated,
  httpBadRequest,
  httpUnauthorized,
  httpForbidden,
  httpMethodNotAllowed,
  httpMethodConflict,
  httpExpectationFailed,
  httpTooManyRequests,
  httpInternalServerError,
  httpNotImplemented,
  httpNotFound,
  sortHelper,
  calculateOffset,
  toSnackCase,
  waitMillis,
};
