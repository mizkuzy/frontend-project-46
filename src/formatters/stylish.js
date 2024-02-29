import _ from 'lodash';

const BASE_INDENT_COUNT = 4;
const SHIFT = 2;

const getDifferenceSign = (noSign, isAdded) => {
  if (noSign) {
    return undefined;
  }

  return isAdded ? '+' : '-';
};

const getBeforePropSign = (differenceSign) => (differenceSign ? `${differenceSign} ` : '');

const getIndent = (indentsCount) => ' '.repeat(indentsCount);

const createLine = (key, value, isObject, indentsCount, noSign, isAdded) => {
  const indent = getIndent(indentsCount);
  const differenceSign = getDifferenceSign(noSign, isAdded);

  if (isObject) {
    return `${indent}${getBeforePropSign(differenceSign)}${key}: {`;
  }

  return `${indent}${getBeforePropSign(differenceSign)}${key}: ${String(value)}`;
};

const createCloseObjectPropLine = (indentsCount) => {
  const indent = ' '.repeat(indentsCount);

  return `${indent}}`;
};

function transformObjectToLine(value, indentsCount) {
  const strings = JSON.stringify(value, null, BASE_INDENT_COUNT)
    .replaceAll('"', '')
    .split('\n')
    .map((str) => (str.endsWith(',') ? str.slice(0, str.length - 1) : str))
    .map((str) => `${getIndent(indentsCount)}${str}`);

  // need to remove open and close prop with brackets to set indents manually
  return strings
    .slice(1, strings.length - 1)
    .join('\n');
}

function getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, isAdded) {
  const openLine = createLine(key, undefined, true, indentWithChangeCount, false, isAdded);
  const closeLine = createCloseObjectPropLine(indentWithoutChangeCount);
  const line = transformObjectToLine(value, indentWithoutChangeCount);

  return { openLine, closeLine, line };
}

const stylish = (diffNodes) => {
  const iter = (depth, diffNodesInner) => {
    const indentWithoutChangeCount = BASE_INDENT_COUNT * depth;
    const indentWithChangeCount = indentWithoutChangeCount - SHIFT;

    const nodesSorted = _.sortBy(diffNodesInner, (el) => el.key);

    const result = nodesSorted.reduce((acc, {
      key, type, value, oldValue, children,
    }) => {
      switch (type) {
        case 'nested': {
          const openLine = createLine(key, undefined, true, indentWithoutChangeCount, true);
          const nodeChildren = iter(depth + 1, children);
          const closeLine = createCloseObjectPropLine(indentWithoutChangeCount);

          return [
            ...acc,
            openLine,
            nodeChildren,
            closeLine,
          ];
        }
        case 'added': {
          if (_.isPlainObject(value)) {
            const {
              openLine,
              closeLine,
              line,
            } = getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, true);

            return [
              ...acc,
              openLine,
              line,
              closeLine,
            ];
          }

          const line = createLine(key, value, false, indentWithChangeCount, false, true);
          return [
            ...acc,
            line,
          ];
        }
        case 'deleted': {
          if (_.isPlainObject(value)) {
            const {
              openLine,
              closeLine,
              line,
            } = getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, false);

            return [
              ...acc,
              openLine,
              line,
              closeLine,
            ];
          }

          const line = createLine(key, value, false, indentWithChangeCount, false, false);
          return [
            ...acc,
            line,
          ];
        }
        case 'changed': {
          if (_.isPlainObject(value)) {
            const {
              openLine,
              closeLine,
              line: addedLine,
            } = getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, true);

            const removedLine = createLine(
              key,
              value,
              false,
              indentWithChangeCount,
              false,
              false,
            );

            return [
              ...acc,
              removedLine,
              openLine,
              addedLine,
              closeLine,
            ];
          }

          if (_.isPlainObject(oldValue)) {
            const {
              openLine,
              closeLine,
              line: removedLine,
            } = getLines(key, oldValue, indentWithChangeCount, indentWithoutChangeCount, false);

            const addedLine = createLine(
              key,
              value,
              false,
              indentWithChangeCount,
              false,
              true,
            );

            return [
              ...acc,
              openLine,
              removedLine,
              closeLine,
              addedLine,
            ];
          }

          const removedProp = createLine(key, oldValue, false, indentWithChangeCount, false, false);
          const addedProp = createLine(key, value, false, indentWithChangeCount, false, true);

          return [
            ...acc,
            removedProp,
            addedProp,
          ];
        }
        // unchanged
        default: {
          const line = createLine(key, value, false, indentWithoutChangeCount, true);
          return [
            ...acc,
            line,
          ];
        }
      }
    }, []);

    return result.join('\n');
  };

  const result = iter(1, diffNodes);

  return [
    '{',
    result,
    '}',
  ].join('\n');
};

export default stylish;
