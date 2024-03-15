const fs = require('fs').promises;
const nodePath = require('path');
const logger = require('./logger');

const CACHE_PATH = 'cache';

const dirExists = async (path) => {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
};

const write = async (key, data) => {
  logger.log(`Writing '${key}' to cache ...`);
  const dataToWrite = {
    created: Date.now(),
    data,
  };

  const cacheDir = nodePath.join(__dirname, CACHE_PATH);
  const cacheDirExists = await dirExists(cacheDir);
  if (!cacheDirExists){
    await fs.mkdir(cacheDir);
  }

  return fs.writeFile(nodePath.join(cacheDir, `${key}.json`), JSON.stringify(dataToWrite, null, 2));
};

const read = async (key) => {
  logger.log(`Reading '${key}' from cache ...`);
  let data;
  try {
    data = await fs.readFile(nodePath.join(__dirname, CACHE_PATH, `${key}.json`));
  } catch (error) {
    return { data: undefined };
  }
  const json = JSON.parse(data);
  const age = (Date.now() - json.created) / 1000;
  return { age, data: json.data };
};

module.exports = {
  write,
  read,
};
