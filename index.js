const fs = require('fs');
const processArguments = require('./processArguments');
const { getCollections, getEnvironments } = require('./data');
const cache = require('./cache');
const { findRequestById, getObjectName } = require('./helpers');
const logger = require('./logger');
const runRequest = require('./runRequest');

const exec = async (arguments) => {
  try {
    const collections = getCollections();
    const environments = getEnvironments();
    const { command, flags } = processArguments(arguments, { environments, collections });
    if (!command) return;
  
    const request = findRequestById(collections, command);
    const environment = environments.find((environment) => flags.environment ? environment.id === flags.environment : environment.default);
    if (!request) {
      throw new Error(`Request '${command}' not found`);
    }
    if (!environment) {
      if (flags.environment) throw new Error(`Environment '${flags.environment}' not found`);
      else throw new Error(`No environment flag or default set`);
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