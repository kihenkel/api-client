const getDate = () => new Date().toLocaleString();

module.exports = {
  announce: (message) => console.log(`[${getDate()}] ${message}`),
  log: (...messages) => console.log(`[${getDate()}]`, ...messages),
  warn: (...messages) => console.warn(`[${getDate()}]`, ...messages),
  error: (...messages) => console.error(`[${getDate()}] (ERROR)`, ...messages),
};
