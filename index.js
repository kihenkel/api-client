const environments = require('./environments');
const collections = require('./collections');
const processArguments = require('./processArguments');
const { findRequestById } = require('./helpers');
const logger = require('./logger');
const runRequest = require('./runRequest');

const exec = async (arguments) => {
  try {
    const { command, flags } = processArguments(arguments, { environments, collections });
    if (!command) return;
  
    const { request, collection } = findRequestById(collections, command);
    const environment = environments.find((environment) => environment.id === flags.environment);
    if (!request) {
      throw new Error(`Request '${command}' not found`);
    }
    if (!environment) {
      throw new Error(`Environment '${flags.environment}' not found`);
    }
    await runRequest(request, collection, environment);
  } catch (error) {
    logger.error(error.message);
  }
};

exec(process.argv.slice(2));