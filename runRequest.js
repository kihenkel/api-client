const { getCollections } = require('./data');
const {
  keyValueArrayToObject,
  findRequestById,
  getProperty,
  getObjectName,
  getVariableFromCodeString,
} = require('./helpers');
const doRequest = require('./http');
const cache = require('./cache');
const logger = require('./logger');

const getDependencyCacheKey = (request) => `dependency_${request.id}`;

const replaceVariables = (string, variables) => {
  return string.replace(/{{(.*?)}}/g, (_match, variable) => {
    let matchedVar;
    if (variable.startsWith('$')) {
      // Character $ used for dependency results
      matchedVar = getProperty(variables.__dependencyResults, variable.slice(1));
    } else if (variable.startsWith('@')) {
      // Character @ used for JS code
      matchedVar = getVariableFromCodeString(variable.slice(1));
    } else {
      matchedVar = variables[variable];
    }
    if (matchedVar === undefined) {
      throw new Error(`Variable '${variable}' not found`);
    }
    return matchedVar;
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

const executeRequest = async (request, environment, options, dependencyResults) => {
  const { isDependency, flags } = options;
  if (isDependency && request.cacheAsDependency && !flags.noCache) {
    const { age, data } = await cache.read(getDependencyCacheKey(request));
    if (!data) {
      logger.announce(`No cache found for '${request.id}', executing request ...`);
    } else if (age < request.cacheAsDependency) {
      logger.announce(`Valid cache for '${request.id}', skipping request!`);
      return data;
    } else {
      logger.announce(`Outdated cache for '${request.id}', executing request ...`);
    }
  }

  const variables = {
    ...keyValueArrayToObject(environment.variables || []),
    ...keyValueArrayToObject(request.variables || []),
    __dependencyResults: dependencyResults,
  };

  const parsedUrl = parseUrl(request.url, variables);
  const parsedHeaders = (request.headers || []).map(header => parseHeader(header, variables));
  const parsedBody = parseBody(request.body, variables);

  const requestOptions = {
    method: request.method ?? 'GET',
    headers: keyValueArrayToObject(parsedHeaders),
    body: parsedBody,
  };

  const requestResult = await doRequest(parsedUrl, requestOptions);

  if (isDependency && request.cacheAsDependency && !flags.noCache) {
    await cache.write(getDependencyCacheKey(request), requestResult);
  }
  return requestResult;
}

const runRequest = async (request, environment, options = {}) => {
  logger.announce(`Running request '${getObjectName(request)}' ...`);
  const { isDependency } = options;

  let dependencyResults = [];
  if (request.dependencies?.length > 0) {
    logger.announce(`Request dependencies detected: ${request.dependencies}`);
    const dependencyRequests = request.dependencies.map(requestId => findRequestById(getCollections(), requestId));
    dependencyResults = await Promise.all(
      dependencyRequests.map((dependencyRequest) => 
        runRequest(dependencyRequest, environment, { ...options, isDependency: true })
      )
    );
  }

  const requestResult = await executeRequest(request, environment, options, dependencyResults);
  const { status, statusText, json, text } = requestResult;
  const responseData = json || text;
  if (isDependency && status >= 200 && status < 300) {
    return responseData;
  }
  console.log('');
  logger.announce(`Response: ${status} ${statusText}`);
  logger.announce('Response Body:');
  const stringified = JSON.stringify(responseData, null, 2);
  console.log(stringified);

  return responseData;
};

module.exports = runRequest;