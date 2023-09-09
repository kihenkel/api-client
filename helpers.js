const getAllRequestIds = (collection) => {
  const ids = collection.requests.reduce((currentIds, request) => {
    if (request.requests) {
      return currentIds.concat(...getAllRequestIds(request));
    }
    return currentIds.concat(request.id);
  }, []);
  return ids;
};

const findRequestByIdFromCollection = (collection, id) => {
  let foundRequest;
  collection.requests.find((request) => {
    if (request.requests) {
      foundRequest = findRequestByIdFromCollection(request, id);
    } else {
      foundRequest = request.id === id ? request : undefined;
    }
    return !!foundRequest;
  });
  return foundRequest;
}

const findRequestById = (collections, id) => {
  let request;
  const collection = collections.find((collection) => {
    request = findRequestByIdFromCollection(collection, id);
    return !!request;
  });
  return { request, collection };
};

const keyValueArrayToObject = (array) => {
  return array.reduce((object, item) => {
    return {
      ...object,
      [item.key]: item.value,
    };
  }, {});
};

module.exports = {
  getAllRequestIds,
  findRequestById,
  keyValueArrayToObject,
};
