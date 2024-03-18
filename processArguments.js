const { getAllRequestIds } = require('./helpers');
const logger = require('./logger');

const AVAILABLE_FLAGS = [{
  name: 'environment',
  flags: {
    primary: ['e'],
    secondary: ['env']
  },
  needsValue: true,
  description: 'Environment to run the command in',
  announcement: (value) => `Running in ${value} environment`,
  required: false,
  validate: (value, context) => {
    if (!context.environments.find((environment) => environment.id === value)) {
      return { success: false, message: `Environment '${value}' not found` };
    }
    return { success: true };
  }
}, {
  name: 'saveToFile',
  flags: {
    primary: ['s'],
    secondary: ['save']
  },
  needsValue: true,
  description: 'File to save the response to',
  announcement: (value) => `Saving response to file ${value}`,
  required: false,
}, {
  name: 'clearCache',
  flags: {
    primary: ['c'],
    secondary: ['clearCache']
  },
  needsValue: false,
  description: 'Clear all cached request responses before executing request',
  announcement: () => 'Clearing cache before executing request',
  required: false,
}, {
  name: 'noCache',
  flags: {
    primary: ['n'],
    secondary: ['noCache']
  },
  needsValue: false,
  description: 'Do not use any cached responses for this request',
  announcement: () => `Won't use cache for this request`,
  required: false,
}];

const SPECIAL_COMMANDS = [{
  name: 'help',
  action: (context) => {
    logger.announceNoTimestamp(`Available commands: ${SPECIAL_COMMANDS.map((command) => command.name).join(', ')}`);
    logger.announceNoTimestamp(`Available flags:\n${AVAILABLE_FLAGS.map((flag) => `    -${flag.flags.primary.join(', -')}, --${flag.flags.secondary.join(', --')}: ${flag.description}`).join('\n')}`);
    logger.announceNoTimestamp(`Available environments: ${context.environments.map((environment) => environment.id).join(', ')}`);
    logger.announceNoTimestamp(`Available requests:`);
    context.collections.forEach((collection) => {
      logger.announceNoTimestamp(`  ${collection.name}:`);
      logger.announceNoTimestamp(`    ${getAllRequestIds(collection).join(', ')}`);
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
    const flagIndex = otherArguments.findIndex((argument) => {
      if (argument.startsWith('--')) {
        const argumentFlag = argument.slice(2);
        return flag.flags.secondary.includes(argumentFlag);
      } else if (argument.startsWith('-')) {
        const argumentFlags = argument.slice(1).split('');
        const foundArgumentFlag = argumentFlags.find((argumentFlag) => flag.flags.primary.includes(argumentFlag));
        if (foundArgumentFlag && flag.needsValue && argumentFlags.length > 1) {
          throw new Error(`Flag -${foundArgumentFlag} needs to be separated because it requires a value`);
        }
        return foundArgumentFlag;
      }
      return false;
    });
    if (flagIndex === -1) return acc;

    const flagValue = flag.needsValue ? otherArguments[flagIndex + 1] : true;
    if (flag.needsValue && (flagValue === undefined || flagValue.startsWith('-'))) {
      throw new Error(`Flag ${otherArguments[flagIndex]} needs a value`);
    }

    if (flag.validate && !flag.validate(flagValue, context).success) {
      throw new Error(flag.validate(flagValue, context).message);
    }

    acc[flag.name] = flagValue;
    logger.announce(`-${flag.flags.primary[0]}: ${flag.announcement(flagValue)}`);
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