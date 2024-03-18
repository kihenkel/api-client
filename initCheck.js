const initCheck = ({
  request,
  command,
  environment,
  flags,
}) => {
  if (!global.fetch) {
    return `This app uses the native Node fetch API so a version of >=18 is required`;
  }
  if (!request) {
    return `Request '${command}' not found`;
  }
  if (!environment) {
    if (flags.environment) {
      return `Environment '${flags.environment}' not found`;
    } else {
      return `No environment flag or default set`;
    };
  }

  return false;
};

module.exports = initCheck;
