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

const transformObjectToLines = (obj, indentsCount) => {
  const strings = JSON.stringify(obj, null, BASE_INDENT_COUNT)
    .replaceAll('"', '')
    .split('\n')
    .map((str) => (str.endsWith(',') ? str.slice(0, str.length - 1) : str))
    .map((str) => `${getIndent(indentsCount)}${str}`);

  // need to remove open and close prop with brackets
  return strings
    .slice(1, strings.length - 1)
    .join('\n');
};

const createObjectLines = (key, value, indentWithChangeCount, indentWithoutChangeCount, sign) => {
  const openLine = createLine(key, undefined, true, indentWithChangeCount, sign);
  const closeLine = createCloseObjectPropLine(indentWithoutChangeCount);
  const line = transformObjectToLines(value, indentWithoutChangeCount);

  return { openLine, closeLine, line };
};

const stylish = (diffNodes) => {
  const iter = (depth, diffNodesInner) => {
    const currentIndentsCount = BASE_INDENT_COUNT * depth;
    const currentIndentsWithShiftCount = currentIndentsCount - SHIFT;

    const result = diffNodesInner.map(({
      key, type, value, oldValue, children,
    }) => {
      switch (type) {
        case 'nested': {
          const openLine = createLine(key, undefined, true, currentIndentsCount);
          const closeLine = createCloseObjectPropLine(currentIndentsCount);

          const nodeChildren = iter(depth + 1, children);

          return [
            openLine,
            nodeChildren,
            closeLine,
          ].join('\n');
        }
        case 'added': {
          if (_.isPlainObject(value)) {
            const {
              openLine,
              closeLine,
              line,
            } = createObjectLines(key, value, currentIndentsWithShiftCount, currentIndentsCount, '+');

            return [
              openLine,
              line,
              closeLine,
            ].join('\n');
          }

          return createLine(key, value, false, currentIndentsWithShiftCount, '+');
        }
        case 'deleted': {
          if (_.isPlainObject(value)) {
            const {
              openLine,
              closeLine,
              line,
            } = createObjectLines(key, value, currentIndentsWithShiftCount, currentIndentsCount, '-');

            return [
              openLine,
              line,
              closeLine,
            ].join('\n');
          }

          return createLine(key, value, false, currentIndentsWithShiftCount, '-');
        }
        case 'changed': {
          if (_.isPlainObject(value)) {
            const {
              openLine,
              closeLine,
              line: addedLine,
            } = createObjectLines(key, value, currentIndentsWithShiftCount, currentIndentsCount, '+');

            const removedLine = createLine(
              key,
              oldValue,
              false,
              currentIndentsWithShiftCount,
              '-',
            );

            return [
              removedLine,
              openLine,
              addedLine,
              closeLine,
            ].join('\n');
          }

          if (_.isPlainObject(oldValue)) {
            const {
              openLine,
              closeLine,
              line: removedLine,
            } = createObjectLines(key, oldValue, currentIndentsWithShiftCount, currentIndentsCount, '-');

            const addedLine = createLine(
              key,
              value,
              false,
              currentIndentsWithShiftCount,
              '+',
            );

            return [
              openLine,
              removedLine,
              closeLine,
              addedLine,
            ].join('\n');
          }

          const removedProp = createLine(key, oldValue, false, currentIndentsWithShiftCount, '-');
          const addedProp = createLine(key, value, false, currentIndentsWithShiftCount, '+');

          return [
            removedProp,
            addedProp,
          ].join('\n');
        }

        case 'unchanged': {
          return createLine(key, value, false, currentIndentsCount);
        }
        default:
          throw new Error(`Node type ${type} is not supported`);
      }
    });

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
