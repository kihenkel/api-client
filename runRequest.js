const { keyValueArrayToObject } = require('./helpers');
const doRequest = require('./http');
const logger = require('./logger');

const replaceVariables = (string, variables) => {
  return string.replace(/{{(.*?)}}/g, (_match, variable) => {
    if (variables[variable] === undefined) {
      throw new Error(`Variable '${variable}' not found`);
    }
    return variables[variable];
  });
};


const parseUrl = (url, variables) => {
  let parsedUrl = url;

  parsedUrl = replaceVariables(parsedUrl, variables);

  if (!parsedUrl.startsWith('http')) {
    logger.warn(`URL '${parsedUrl}' does not start with 'http'. Assuming HTTPS.`);
    parsedUrl = `https://${parsedUrl}`;
  }

  if (parsedUrl.startsWith('https://localhost') || parsedUrl.startsWith('https://127.0.0.1')) {
    logger.warn(`Localhost IP is being called with HTTPS protocol. This might not be intentional.`);
  }
  
  return parsedUrl;
};

const parseHeader = (header, variables) => {
  return {
    ...header,
    value: replaceVariables(header.value, variables),
  };
};

const parseBody = (body, variables) => {
  if (!body) return undefined;
  return replaceVariables(JSON.stringify(body), variables);
};

const runRequest = async (request, collection, environment) => {
  logger.announce(`Running request '${request.name}' ...`);

  const variables = {
    ...keyValueArrayToObject(environment.values || []),
    ...keyValueArrayToObject(collection.variables || []),
  };

  const parsedUrl = parseUrl(request.url, variables);
  const parsedHeaders = (request.headers || []).map(header => parseHeader(header, variables));
  const parsedBody = parseBody(request.body, variables);

  const options = {
    method: request.method,
    headers: keyValueArrayToObject(parsedHeaders),
    body: parsedBody,
  };

  const { status, statusText,  json, text } = await doRequest(parsedUrl, options);
  console.log('');
  logger.announce(`Response: ${status} ${statusText}`);
  logger.announce('Response Body:');
  console.log(JSON.stringify(json || text, null, 2));
};

module.exports = runRequest;