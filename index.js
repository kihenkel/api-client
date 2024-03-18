const fs = require('fs');
const processArguments = require('./processArguments');
const { getCollections, getEnvironments } = require('./data');
const cache = require('./cache');
const { findRequestById, getObjectName } = require('./helpers');
const runRequest = require('./runRequest');
const initCheck = require('./initCheck');
const logger = require('./logger');

const exec = async (arguments) => {
  try {
    const collections = getCollections();
    const environments = getEnvironments();
    const { command, flags } = processArguments(arguments, { environments, collections });
    if (!command) return;
  
    const request = findRequestById(collections, command);
    const environment = environments.find((environment) => flags.environment ? environment.id === flags.environment : environment.default);
    const initCheckFailedMessage = initCheck({ request, command, environment, flags });
    if (initCheckFailedMessage) {
      logger.error(initCheckFailedMessage);
      return;
    }
    if (!flags.environment) {
      logger.announce(`No environment flag set, using default environment '${getObjectName(environment)}' ...`)
    };

    if (flags.clearCache) {
      await cache.clear();
    }

    const response = await runRequest(request, environment, { flags });
    if (flags.saveToFile) {
      fs.writeFileSync(flags.saveToFile, JSON.stringify(response, null, 2));
    }
  } catch (error) {
    logger.error(error);
  }
};

exec(process.argv.slice(2));