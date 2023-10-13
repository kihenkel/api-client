const getDate = () => new Date().toLocaleString();

const color = {
  grey: (message) => `\x1b[90m${message}\x1b[0m`,
  yellow: (message) => `\x1b[33m${message}\x1b[0m`,
  red: (message) => `\x1b[31m${message}\x1b[0m`,
};

const getTimestamp = () => color.grey(`[${getDate()}]`);

module.exports = {
  announce: (message) => console.log(`${getTimestamp()} ${message}`),
  log: (...messages) => console.log(`${getTimestamp()}`, ...messages),
  warn: (...messages) => console.warn(`${getTimestamp()} ${color.yellow('Warning!')}`, ...messages),
  error: (...messages) => console.error(`${getTimestamp()} ${color.red('[ERROR]')}`, ...messages),
};
