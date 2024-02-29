import _ from 'lodash';

const getSortedUniqueKeys = (arr) => {
  const keys = arr.map(({ key }) => key);

  const uniqueKeys = _.uniq(keys);

  return _.sortBy(uniqueKeys);
};

const getPropStatus = (key, equalProperties = {}, addedProperties = {}, removedProperties = {}) => {
  const isPropExistInBothFiles = Object.hasOwn(equalProperties, key);

  const isValueAdded = Object.hasOwn(addedProperties, key);
  const isValueRemoved = Object.hasOwn(removedProperties, key);

  const isValueUpdated = isValueAdded && isValueRemoved;

  return {
    isPropExistInBothFiles,
    isValueUpdated,
    isValueAdded,
    isValueRemoved,
  };
};

export {
  getSortedUniqueKeys,
  getPropStatus,
};
