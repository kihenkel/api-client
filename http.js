const logger = require('./logger');

const doRequest = async (url, options) => {
  logger.announce(`${options.method} ${url}`);
  const response = await fetch(url, options);
  const json = response.headers?.get('content-type')?.includes('application/json') ? await response.json() : null;
  const text = json ? null : await response.text();

  if (!response.ok) {
    logger.error(`Request failed: ${response.statusText}`);
  }

  return {
    text,
    json,
    status: response.status,
    statusText: response.statusText,
  };
};

module.exports = doRequest;