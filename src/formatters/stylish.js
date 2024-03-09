import _ from 'lodash';

const BASE_INDENT_COUNT = 4;
const SHIFT = 2;

const getIndent = (indentsCount) => ' '.repeat(indentsCount);

const createLine = (key, value, isObject, indentsCount, sign) => {
  const indent = getIndent(indentsCount);

  const beforeProp = sign ? `${sign} ` : '';

  if (isObject) {
    return `${indent}${beforeProp}${key}: {`;
  }

  return `${indent}${beforeProp}${key}: ${String(value)}`;
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

function getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, sign) {
  const openLine = createLine(key, undefined, true, indentWithChangeCount, sign);
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
          const openLine = createLine(key, undefined, true, indentWithoutChangeCount);
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
            } = getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, '+');

            return [
              ...acc,
              openLine,
              line,
              closeLine,
            ];
          }

          const line = createLine(key, value, false, indentWithChangeCount, '+');
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
            } = getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, '-');

            return [
              ...acc,
              openLine,
              line,
              closeLine,
            ];
          }

          const line = createLine(key, value, false, indentWithChangeCount, '-');
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
            } = getLines(key, value, indentWithChangeCount, indentWithoutChangeCount, '+');

            const removedLine = createLine(
              key,
              value,
              false,
              indentWithChangeCount,
              '-',
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
            } = getLines(key, oldValue, indentWithChangeCount, indentWithoutChangeCount, '-');

            const addedLine = createLine(
              key,
              value,
              false,
              indentWithChangeCount,
              '+',
            );

            return [
              ...acc,
              openLine,
              removedLine,
              closeLine,
              addedLine,
            ];
          }

          const removedProp = createLine(key, oldValue, false, indentWithChangeCount, '-');
          const addedProp = createLine(key, value, false, indentWithChangeCount, '+');

          return [
            ...acc,
            removedProp,
            addedProp,
          ];
        }
        case 'unchanged': {
          const line = createLine(key, value, false, indentWithoutChangeCount);
          return [
            ...acc,
            line,
          ];
        }
        default:
          throw new Error('Node type is not supported');
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
