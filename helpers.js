const logger = require('./logger');

const getAllRequestIds = (collection) => {
  const ids = collection.requests.reduce((currentIds, request) => {
    if (request.requests) {
      return currentIds.concat(...getAllRequestIds(request));
    }
    return currentIds.concat(request.id);
  }, []);
  return ids;
};

const cascadingProperties = ['variables', 'headers', 'dependencies'];
const mergeRequestProperties = (objA, objB) => {
  return cascadingProperties.reduce((currentProperties, propertyName) => {
    const parentProperty = objA[propertyName] ?? [];
    const currentProperty = currentProperties[propertyName] ?? [];
    const mergedParentAndCurrent = mergePropertyArrays(parentProperty, currentProperty);
    return {
      ...currentProperties,
      [propertyName]: objB[propertyName] ?
        mergePropertyArrays(mergedParentAndCurrent, objB[propertyName]) :
        mergedParentAndCurrent,
    };
  }, {})
};

// arr2 takes precedence
const mergePropertyArrays = (arr1, arr2) => {
  const mergedArray = [...arr1];
  arr2.forEach((item2) => {
    if (typeof item2 === 'object') {
      if (!item2.key) {
        logger.warn(`Cannot merge array item as it is missing the 'key' identifier.`);
        return;
      }
      const arr1Index = mergedArray.findIndex((item1) => item1?.key === item2.key);
      if (arr1Index >= 0) {
        mergedArray[arr1Index] = item2;
      } else {
        mergedArray.push(item2);
      }
    } else {
      if (mergedArray.indexOf(item2) === -1) {
        mergedArray.push(item2);
      }
    }
  });

  return mergedArray;
};

const findRequestById = (collections, id, parentProperties = {}) => {
  let foundRequest;
  collections.some((request) => {
    const collectionProperties = mergeRequestProperties(parentProperties, request);
    if (request.requests) {
      foundRequest = findRequestById(request.requests, id, collectionProperties);
    } else {
      foundRequest = request.id === id ?
        { ...request, ...mergeRequestProperties(collectionProperties, request) } :
        undefined;
    }
    return !!foundRequest;
  });
  return foundRequest;
};

const keyValueArrayToObject = (array) => {
  return array.reduce((object, item) => {
    return {
      ...object,
      [item.key]: item.value,
    };
  }, {});
};

const getProperty = (obj, path, delimiter = '.') => {
  const property = path.split(delimiter).reduce((currentValue, segment) => {
    if (!currentValue) {
      return undefined;
    }
    return currentValue[segment];
  }, obj);
  if (property === undefined) {
    logger.error(`Unable to find '${path}' in object.`);
  }
  if (property === null) {
    logger.warn(`Value '${path}' for given object is null.`);
  }
  return property;
};

const getObjectName = (obj) => obj.name ?? obj.id;

const getVariableFromCodeString = (str) => {
  const codeString = str.startsWith('return ') ? str : `return ${str}`;
  try {
    return new Function(codeString)();
  } catch (error) {
    logger.error('Failed to execute code snipped inside variable brackets', error);
    return undefined;
  }
}

module.exports = {
  getAllRequestIds,
  findRequestById,
  keyValueArrayToObject,
  getProperty,
  getObjectName,
  getVariableFromCodeString,
};
