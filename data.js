const environments = require('./environments');
const collections = require('./collections');

const getEnvironments = () => {
  return environments;
};

const getCollections = () => {
  return collections;
};

module.exports = {
  getEnvironments,
  getCollections,
};
