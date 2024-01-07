import isObject from 'lodash.isobject';
import { getPropStatus, getSortedUniqueKeys } from './helpers.js';

function formatValuesForPrint(from, to) {
  let fromValToPrint = from;
  let toValToPrint = to;

  if (isObject(from)) {
    fromValToPrint = '[complex value]';
  }
  if (isObject(to)) {
    toValToPrint = '[complex value]';
  }

  if (typeof from === 'string') {
    fromValToPrint = `'${from}'`;
  }
  if (typeof to === 'string') {
    toValToPrint = `'${to}'`;
  }
  return { fromValToPrint, toValToPrint };
}

const createLine = (property, from, to, isAdded, isRemoved) => {
  const { fromValToPrint, toValToPrint } = formatValuesForPrint(from, to);

  const isUpdated = isAdded && isRemoved;

  if (isUpdated) {
    return `Property '${property}' was updated. From ${fromValToPrint} to ${toValToPrint}`;
  }

  if (isAdded) {
    return `Property '${property}' was added with value: ${toValToPrint}`;
  }

  return `Property '${property}' was removed`;
};

const plain = ({ diffAddedProperties, diffRemovedProperties, ...rest }) => {
  const iter = (
    parentPropNames,
    addedProperties = {},
    removedProperties = {},
    equalProperties = {},
  ) => {
    const sortedUniqueKeys = getSortedUniqueKeys(
      addedProperties,
      removedProperties,
      equalProperties,
    );

    const lines = [];

    sortedUniqueKeys.forEach((key) => {
      const propPath = [...parentPropNames, key].join('.');

      const {
        isPropExistInBothFiles, isValueAdded, isValueRemoved,
      } = getPropStatus(
        key,
        equalProperties,
        addedProperties,
        removedProperties,
      );

      const addedValue = addedProperties[key];
      const removedValue = removedProperties[key];

      if (isPropExistInBothFiles) {
        const value = equalProperties[key];

        if (isObject(value)) {
          const {
            diffAddedProperties: addedProps,
            diffRemovedProperties: removedProps,
            ...innerRest
          } = value;

          const innerLines = iter([...parentPropNames, key], addedProps, removedProps, innerRest);
          lines.push(...innerLines);
        }
      } else {
        lines.push(createLine(propPath, removedValue, addedValue, isValueAdded, isValueRemoved));
      }
    });

    return lines;
  };

  const result = iter([], diffAddedProperties, diffRemovedProperties, rest);

  return result.join('\n');
};

export default plain;
