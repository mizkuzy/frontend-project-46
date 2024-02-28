import _ from 'lodash';
import { getPropStatus, getSortedUniqueKeys } from './helpers.js';

const BASE_INDENT_COUNT = 4;
const HAS_DIFF_INDENT_COUNT = 2;

const getDifferenceSign = (isAdded) => {
  switch (isAdded) {
    case true:
      return '+';
    case false:
      return '-';
    default:
      return undefined;
  }
};

const getBeforePropSign = (differenceSign) => (differenceSign ? `${differenceSign} ` : '');

const createPrimitivePropLine = (key, value, indentsCount, isAdded) => {
  const indent = ' '.repeat(indentsCount);
  const differenceSign = getDifferenceSign(isAdded);

  return `${indent}${getBeforePropSign(differenceSign)}${key}: ${String(value)}`;
};

const createObjectPropLine = (key, indentsCount, isOpen, isAdded) => {
  const indent = ' '.repeat(indentsCount);
  const differenceSign = getDifferenceSign(isAdded);

  return isOpen ? `${indent}${getBeforePropSign(differenceSign)}${key}: {` : `${indent}}`;
};

const addLines = (depth, key, value, iter, lines, isAdded) => {
  const indentWithoutDiffCount = BASE_INDENT_COUNT * depth;
  const indentWithDiffCount = indentWithoutDiffCount - HAS_DIFF_INDENT_COUNT;

  if (_.isPlainObject(value)) {
    const {
      diffAddedProperties: addedProps,
      diffRemovedProperties: removedProps,
    } = value;

    const innerRest = _.omit(value, ['diffAddedProperties', 'diffRemovedProperties']);
    const innerLines = iter(depth + 1, addedProps, removedProps, innerRest);

    return [
      ...lines,
      createObjectPropLine(
        key,
        isAdded === undefined ? indentWithoutDiffCount : indentWithDiffCount,
        true,
        isAdded,
      ),
      innerLines,
      createObjectPropLine(key, indentWithoutDiffCount, false, isAdded),
    ];
  }

  return [
    ...lines,
    createPrimitivePropLine(
      key,
      value,
      isAdded === undefined ? indentWithoutDiffCount : indentWithDiffCount,
      isAdded,
    ),
  ];
};

const stylish = (diffObj) => {
  const { diffAddedProperties, diffRemovedProperties } = diffObj;
  const rest = _.omit(diffObj, ['diffAddedProperties', 'diffRemovedProperties']);

  const iter = (depth, addedProperties = {}, removedProperties = {}, equalProperties = {}) => {
    const sortedUniqueKeys = getSortedUniqueKeys(
      addedProperties,
      removedProperties,
      equalProperties,
    );

    const result = sortedUniqueKeys.reduce((lines, key) => {
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
        return addLines(depth, key, value, iter, lines);
      }

      if (isValueUpdated) {
        const addedValue = addedProperties[key];
        const removedValue = removedProperties[key];

        if (!_.isPlainObject(addedValue) && !_.isPlainObject(removedValue)) {
          return [
            ...lines,
            createPrimitivePropLine(key, removedValue, indentWithDiffCount, false),
            createPrimitivePropLine(key, addedValue, indentWithDiffCount, true),
          ];
        }

        if (_.isPlainObject(addedValue) && !_.isPlainObject(removedValue)) {
          const {
            diffAddedProperties: addedProps,
            diffRemovedProperties: removedProps,
          } = addedValue;

          const innerRest = _.omit(addedValue, ['diffAddedProperties', 'diffRemovedProperties']);

          const innerLines = iter(depth + 1, addedProps, removedProps, innerRest);

          return [
            ...lines,
            createPrimitivePropLine(key, removedValue, indentWithDiffCount, false),
            createObjectPropLine(key, indentWithDiffCount, true, true),
            innerLines,
            createObjectPropLine(key, indentWithoutDiffCount, false),
          ];
        }

        if (!_.isPlainObject(addedValue) && _.isPlainObject(removedValue)) {
          const {
            diffAddedProperties: addedProps,
            diffRemovedProperties: removedProps,
          } = removedValue;

          const innerRest = _.omit(removedValue, ['diffAddedProperties', 'diffRemovedProperties']);

          const innerLines = iter(depth + 1, addedProps, removedProps, innerRest);

          return [
            ...lines,
            createObjectPropLine(key, indentWithDiffCount, true, false),
            innerLines,
            createObjectPropLine(key, indentWithoutDiffCount, false),
            createPrimitivePropLine(key, addedValue, indentWithDiffCount, true),
          ];
        }
      } else if (isValueAdded) {
        const addedValue = addedProperties[key];
        return addLines(depth, key, addedValue, iter, lines, true);
      } else if (isValueRemoved) {
        const removedValue = removedProperties[key];
        return addLines(depth, key, removedValue, iter, lines, false);
      }

      return lines;
    }, []);

    return result.join('\n');
  };

  const result = iter(1, diffAddedProperties, diffRemovedProperties, rest);

  return [
    '{',
    result,
    '}',
  ].join('\n');
};

export default stylish;
