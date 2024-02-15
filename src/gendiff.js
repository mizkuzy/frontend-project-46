import isObject from 'lodash.isobject';
import uniq from 'lodash.uniq';
import parseFiles from './parser.js';
import getFormattedDiff from './formatters/index.js';

const getDiff = (inputObj1, inputObj2) => {
  const iter = (diffObject, object1, object2) => {
    const keys = [...Object.keys(object1), ...Object.keys(object2)];
    const uniqueKeys = uniq(keys);

    return uniqueKeys.reduce((accumulator, key) => {
      const val1 = object1[key];
      const val2 = object2[key];

      // case both objects
      if (isObject(val1) && isObject(val2)) {
        return {
          ...accumulator, [key]: iter({}, val1, val2),
        };
      }
      if (
        // case one object, one primitive
        (val2 !== undefined && isObject(val1) && !isObject(val2))
        || (val1 !== undefined && isObject(val2) && !isObject(val1))
      ) {
        return {
          ...accumulator,
          diffAddedProperties: { ...accumulator.diffAddedProperties, [key]: val2 },
          diffRemovedProperties: { ...accumulator.diffRemovedProperties, [key]: val1 },
        };
      }
      if (val1 === val2) {
        // case both primitives
        return {
          ...accumulator,
          [key]: val1,
        };
      }
      if (val1 === undefined) {
        return {
          ...accumulator,
          diffAddedProperties: { ...accumulator.diffAddedProperties, [key]: val2 },
        };
      }
      if (val2 === undefined) {
        return {
          ...accumulator,
          diffRemovedProperties: { ...accumulator.diffRemovedProperties, [key]: val1 },
        };
      }

      return {
        ...accumulator,
        diffAddedProperties: { ...accumulator.diffAddedProperties, [key]: val2 },
        diffRemovedProperties: { ...accumulator.diffRemovedProperties, [key]: val1 },
      };
    }, diffObject);
  };

  return iter({}, inputObj1, inputObj2);
};

const generateDifference = (fp1, fp2, formatType = 'stylish') => {
  const [json1, json2] = parseFiles(fp1, fp2);

  const diff = getDiff(json1, json2);

  return getFormattedDiff(diff, formatType);
};

export default generateDifference;
