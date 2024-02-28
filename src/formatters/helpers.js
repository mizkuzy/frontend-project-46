import _ from 'lodash';

const getSortedUniqueKeys = (obj1 = {}, obj2 = {}, obj3 = {}) => {
  const keys = [
    ...Object.keys(obj1),
    ...Object.keys(obj2),
    ...Object.keys(obj3),
  ];

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
