const fs = require('fs');
const processArguments = require('./processArguments');
const { getCollections, getEnvironments } = require('./data');
const { findRequestById } = require('./helpers');
const logger = require('./logger');
const runRequest = require('./runRequest');

const exec = async (arguments) => {
  try {
    const collections = getCollections();
    const environments = getEnvironments();
    const { command, flags } = processArguments(arguments, { environments, collections });
    if (!command) return;
  
    const request = findRequestById(collections, command);
    const environment = environments.find((environment) => environment.id === flags.environment);
    if (!request) {
      throw new Error(`Request '${command}' not found`);
    }
    if (!environment) {
      throw new Error(`Environment '${flags.environment}' not found`);
    }
    const response = await runRequest(request, environment);
    if (flags.saveToFile) {
      fs.writeFileSync(flags.saveToFile, JSON.stringify(response, null, 2));
    }
  } catch (error) {
    logger.error(error);
  }
};

exec(process.argv.slice(2));