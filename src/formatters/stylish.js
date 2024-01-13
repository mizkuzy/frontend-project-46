import isObject from 'lodash.isobject';
import { getPropStatus, getSortedUniqueKeys } from './helpers.js';

const BASE_INDENT_COUNT = 4;
const HAS_DIFF_INDENT_COUNT = 2;

const getDifferenceSign = (isAdded) => {
  let differenceSign;

  switch (isAdded) {
    case true:
      differenceSign = '+';
      break;
    case false:
      differenceSign = '-';
      break;
    default:
      differenceSign = undefined;
  }

  return differenceSign;
};

const getBeforePropSign = (differenceSign) => (differenceSign ? `${differenceSign} ` : '');

const createPrimitivePropLine = (key, value, indentsCount, isAdded) => {
  const indent = ' '.repeat(indentsCount);
  const differenceSign = getDifferenceSign(isAdded);

  return `${indent}${getBeforePropSign(differenceSign)}${key}: ${String(value)}`.trimEnd();
};

const createObjectPropLine = (key, indentsCount, isOpen, isAdded) => {
  const indent = ' '.repeat(indentsCount);
  const differenceSign = getDifferenceSign(isAdded);

  return isOpen ? `${indent}${getBeforePropSign(differenceSign)}${key}: {` : `${indent}}`;
};

const addLines = (depth, key, value, iter, lines, isAdded) => {
  const indentWithoutDiffCount = BASE_INDENT_COUNT * depth;
  const indentWithDiffCount = indentWithoutDiffCount - HAS_DIFF_INDENT_COUNT;

  if (isObject(value)) {
    const {
      diffAddedProperties: addedProps,
      diffRemovedProperties: removedProps,
      ...innerRest
    } = value;

    const innerLines = iter(depth + 1, addedProps, removedProps, innerRest);

    lines.push(createObjectPropLine(
      key,
      isAdded === undefined ? indentWithoutDiffCount : indentWithDiffCount,
      true,
      isAdded,
    ));
    lines.push(innerLines);
    lines.push(createObjectPropLine(key, indentWithoutDiffCount, false, isAdded));
  } else {
    lines.push(createPrimitivePropLine(
      key,
      value,
      isAdded === undefined ? indentWithoutDiffCount : indentWithDiffCount,
      isAdded,
    ));
  }
};

const stylish = ({ diffAddedProperties, diffRemovedProperties, ...rest }) => {
  const iter = (depth, addedProperties = {}, removedProperties = {}, equalProperties = {}) => {
    const sortedUniqueKeys = getSortedUniqueKeys(
      addedProperties,
      removedProperties,
      equalProperties,
    );

    const lines = [];

    sortedUniqueKeys.forEach((key) => {
      const indentWithoutDiffCount = BASE_INDENT_COUNT * depth;
      const indentWithDiffCount = indentWithoutDiffCount - HAS_DIFF_INDENT_COUNT;

      const {
        isPropExistInBothFiles, isValueUpdated, isValueAdded, isValueRemoved,
      } = getPropStatus(
        key,
        equalProperties,
        addedProperties,
        removedProperties,
      );

      if (isPropExistInBothFiles) {
        const value = equalProperties[key];

        addLines(depth, key, value, iter, lines);
      } else if (isValueUpdated) {
        const addedValue = addedProperties[key];
        const removedValue = removedProperties[key];

        if (!isObject(addedValue) && !isObject(removedValue)) {
          lines.push(createPrimitivePropLine(key, removedValue, indentWithDiffCount, false));
          lines.push(createPrimitivePropLine(key, addedValue, indentWithDiffCount, true));
        } else if (isObject(addedValue) && !isObject(removedValue)) {
          const {
            diffAddedProperties: addedProps,
            diffRemovedProperties: removedProps,
            ...innerRest
          } = addedValue;

          const innerLines = iter(depth + 1, addedProps, removedProps, innerRest);

          lines.push(innerLines);
          lines.push(createPrimitivePropLine(key, addedValue, indentWithDiffCount, true));
        } else if (!isObject(addedValue) && isObject(removedValue)) {
          const {
            diffAddedProperties: addedProps,
            diffRemovedProperties: removedProps,
            ...innerRest
          } = removedValue;

          const innerLines = iter(depth + 1, addedProps, removedProps, innerRest);

          lines.push(createObjectPropLine(key, indentWithDiffCount, true, false));
          lines.push(innerLines);
          lines.push(createObjectPropLine(key, indentWithoutDiffCount, false));

          lines.push(createPrimitivePropLine(key, addedValue, indentWithDiffCount, true));
        }
      } else if (isValueAdded) {
        const addedValue = addedProperties[key];

        addLines(depth, key, addedValue, iter, lines, true);
      } else if (isValueRemoved) {
        const removedValue = removedProperties[key];

        addLines(depth, key, removedValue, iter, lines, false);
      }
    });

    return [
      ...lines,
    ].join('\n');
  };

  const result = iter(1, diffAddedProperties, diffRemovedProperties, rest);

  return [
    '{',
    result,
    '}',
  ].join('\n');
};

export default stylish;
