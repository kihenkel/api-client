const { getAllRequestIds } = require('./helpers');
const logger = require('./logger');

const AVAILABLE_FLAGS = [{
  name: 'environment',
  flags: ['-e', '--env'],
  needsValue: true,
  description: 'Environment to run the command in',
  announcement: (value) => `Running in ${value} environment`,
  required: true,
  validate: (value, context) => {
    if (!context.environments.find((environment) => environment.id === value)) {
      return { success: false, message: `Environment '${value}' not found` };
    }
    return { success: true };
  }
}, {
  name: 'saveToFile',
  flags: ['-s', '--save'],
  needsValue: true,
  description: 'File to save the response to',
  announcement: (value) => `Saving response to file ${value}`,
  required: false,
}];

const SPECIAL_COMMANDS = [{
  name: 'help',
  action: (context) => {
    logger.announce(`Available commands: ${SPECIAL_COMMANDS.map((command) => command.name).join(', ')}`);
    logger.announce(`Available flags:\n${AVAILABLE_FLAGS.map((flag) => `    ${flag.flags.join(', ')}: ${flag.description}`).join('/n')}`);
    logger.announce(`Available environments: ${context.environments.map((environment) => environment.id).join(', ')}`);
    logger.announce(`Available requests:`);
    context.collections.forEach((collection) => {
      logger.announce(`  ${collection.name}:`);
      logger.announce(`    ${getAllRequestIds(collection).join(', ')}`);
    });
  },
}];

const processArguments = (arguments, context) => {
  const [command, ...otherArguments] = arguments;

  const specialCommand = SPECIAL_COMMANDS.find((specialCommand) => specialCommand.name === command);
  if (specialCommand) {
    specialCommand.action(context);
    return {};
  }

  const flags = AVAILABLE_FLAGS.reduce((acc, flag) => {
    const flagIndex = otherArguments.findIndex((argument) => flag.flags.includes(argument));
    if (flagIndex === -1) return acc;

    const flagValue = flag.needsValue ? otherArguments[flagIndex + 1] : true;
    if (flagValue === undefined || flagValue.startsWith('-')) {
      throw new Error(`Flag ${otherArguments[flagIndex]} needs a value`);
    }

    if (flag.validate && !flag.validate(flagValue, context).success) {
      throw new Error(flag.validate(flagValue, context).message);
    }

    acc[flag.name] = flagValue;
    logger.announce(flag.announcement(flagValue));
    return acc;
  }, {});

  AVAILABLE_FLAGS.filter((flag) => flag.required).forEach((flag) => {
    if (!flags[flag.name]) {
      throw new Error(`Flag '${flag.name}' (${flag.flags}) is required`);
    }
  });

  return {
    command,
    flags,
  }
};

module.exports = processArguments;