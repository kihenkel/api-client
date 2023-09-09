module.exports = {
  announce: (message) => console.log(`  ${message}`),
  log: (...messages) => console.log(...messages),
  warn: (...messages) => console.warn(...messages),
  error: (...messages) => console.error('[ERROR]', ...messages),
};
