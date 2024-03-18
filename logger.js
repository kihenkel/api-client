const getDate = () => new Date().toLocaleString();

const Color = {
  grey: (message) => `\x1b[90m${message}\x1b[0m`,
  yellow: (message) => `\x1b[33m${message}\x1b[0m`,
  red: (message) => `\x1b[31m${message}\x1b[0m`,
  cyan: (message) => `\x1b[36m${message}\x1b[0m`,
};

const getTimestamp = () => Color.grey(`[${getDate()}]`);

module.exports = {
  announce: (message) => console.log(`${getTimestamp()} ${message}`),
  log: (...messages) => console.log(`${getTimestamp()}`, ...messages),
  warn: (...messages) => console.warn(`${getTimestamp()} ${Color.yellow('[WARNING]')}`, ...messages),
  error: (...messages) => console.error(`${getTimestamp()} ${Color.red('[ERROR]')}`, ...messages),
  announceNoTimestamp: (message) => console.log(` ${message}`),
  Color,
};
