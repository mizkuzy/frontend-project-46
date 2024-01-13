import isObject from 'lodash.isobject';
import uniq from 'lodash.uniq';
import parseFiles from './parser.js';
import getFormattedDiff from './formatters/index.js';

const getDiff = (inputObj1, inputObj2) => {
  const iter = (acc, object1, object2) => {
    const keys = [...Object.keys(object1), ...Object.keys(object2)];
    const uniqueKeys = uniq(keys);

    const newAcc = { ...acc };
    uniqueKeys.forEach((key) => {
      const val1 = object1[key];
      const val2 = object2[key];

      // case both objects
      if (isObject(val1) && isObject(val2)) {
        newAcc[key] = iter({}, val1, val2);
      } else if (
        // case one object, one primitive
        (val2 !== undefined && isObject(val1) && !isObject(val2))
        || (val1 !== undefined && isObject(val2) && !isObject(val1))
      ) {
        newAcc.diffAddedProperties = { ...newAcc.diffAddedProperties, [key]: val2 };
        newAcc.diffRemovedProperties = { ...newAcc.diffRemovedProperties, [key]: val1 };
      } else if (val1 === val2) {
      // case both primitives
        newAcc[key] = val1;
      } else if (val1 === undefined) {
        newAcc.diffAddedProperties = { ...newAcc.diffAddedProperties, [key]: val2 };
      } else if (val2 === undefined) {
        newAcc.diffRemovedProperties = { ...newAcc.diffRemovedProperties, [key]: val1 };
      } else {
        newAcc.diffAddedProperties = { ...newAcc.diffAddedProperties, [key]: val2 };
        newAcc.diffRemovedProperties = { ...newAcc.diffRemovedProperties, [key]: val1 };
      }
    });

    return newAcc;
  };

  return iter({}, inputObj1, inputObj2);
};

const generateDifference = (fp1, fp2, formatType = 'stylish') => {
  const [json1, json2] = parseFiles(fp1, fp2);

  const diff = getDiff(json1, json2);

  return getFormattedDiff(diff, formatType);
};

export default generateDifference;
