const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const toId = (str) => str
  .replace(/[^a-zA-Z0-9]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

const importDir = (directoryPath) => {
  logger.log(`Importing data from ${directoryPath} ...`);
  const files = fs.readdirSync(directoryPath);
  return files.map((fileName) => {
    logger.log('Importing file: ', fileName, '...');
    const file = fs.readFileSync(path.join(directoryPath, fileName));
    return JSON.parse(file);
  });
};

const migrateCollectionItem = (item, id) => {
  const itemId = id + toId(item.name);
  if (item.item) {
    return {
      name: item.name,
      requests: item.item.map((collectionItem) => migrateCollectionItem(collectionItem, `${itemId}_`)),
    };
  }
  return {
    id: itemId,
    name: item.name,
    url: item.request.url?.raw,
    method: item.request.method,
    headers: item.request.header.map((header) => {
      return {
        key: header.key,
        value: header.value,
      };
    }),
    body: item.request.body?.raw && JSON.parse(item.request.body.raw),
  };
};

const migrateCollection = (collection) => {
  const id = toId(collection.info.name);
  return {
    name: collection.info.name,
    requests: collection.item?.map((collectionItem) => migrateCollectionItem(collectionItem, `${id}_`)) || [],
    variables: collection.variable?.map((variable) => {
      return {
        key: variable.key,
        value: variable.value,
      };
    }) || [],
  };
};

const migrateEnvironment = (environment) => {
  return {
    id: toId(environment.name),
    name: environment.name,
    values: environment.values.map((value) => {
      return {
        key: value.key,
        value: value.value,
      };
    }),
  }
};

const exec = () => {
  const collections = importDir(path.join(__dirname, 'postmanData', 'collections'));
  const environments = importDir(path.join(__dirname, 'postmanData', 'environments'));

  const migratedEnvironments = environments.map((environment) => migrateEnvironment(environment));
  const migratedCollections = collections.map((collection) => migrateCollection(collection));

  logger.log(`Saving ${migratedEnvironments.length} migrated environments ...`);
  logger.log(`Saving ${migratedCollections.length} migrated collections ...`);
  fs.writeFileSync(path.join(__dirname, 'environments.json'), JSON.stringify(migratedEnvironments, null, 2));
  fs.writeFileSync(path.join(__dirname, 'collections.json'), JSON.stringify(migratedCollections, null, 2));

  logger.log('Done!');
};

exec();
