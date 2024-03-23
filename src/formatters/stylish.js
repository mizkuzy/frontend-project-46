const BASE_INDENT_COUNT = 4;
const SHIFT = 2;

const getIndent = (indentsCount) => ' '.repeat(indentsCount);

const formatValue = (input, indent, space) => {
  const inputStrings = JSON.stringify(input, null, space)
    .split('\n');

  if (inputStrings.length === 1) {
    return input;
  }

  const firstString = inputStrings[0];
  const restStrings = inputStrings.slice(1);

  const strings = restStrings
    .map((str) => (str.endsWith(',') ? str.slice(0, str.length - 1) : str))
    .map((str) => `${indent}${str}`);

  return [firstString, ...strings].join('\n');
};

const createLine = (key, value, depth, sign) => {
  const indentsCount = BASE_INDENT_COUNT * depth;
  const indentsWithShiftCount = indentsCount - SHIFT;

  const indent = getIndent(sign ? indentsWithShiftCount : indentsCount);
  const indentWithoutShift = getIndent(indentsCount);

  const beforeProp = sign ? `${sign} ` : '';

  const transformedValue = formatValue(value, indentWithoutShift, BASE_INDENT_COUNT);

  return `${indent}${beforeProp}${key}: ${transformedValue}`;
};

const stylish = (diffNodes) => {
  const iter = (depth, diffNodesInner) => {
    const result = diffNodesInner.map(({
      key, type, value, oldValue, children,
    }) => {
      switch (type) {
        case 'nested': {
          const nodeChildren = iter(depth + 1, children);
          const indentsCount = BASE_INDENT_COUNT * depth;
          const indent = getIndent(indentsCount);
          return [
            `${indent}${key}: {`,
            nodeChildren,
            `${indent}}`,
          ].join('\n');
        }
        case 'added': {
          return createLine(key, value, depth, '+');
        }
        case 'deleted': {
          return createLine(key, value, depth, '-');
        }
        case 'changed': {
          const addedProp = createLine(key, value, depth, '+');
          const removedProp = createLine(key, oldValue, depth, '-');

          return [
            removedProp,
            addedProp,
          ].join('\n');
        }

        case 'unchanged': {
          return createLine(key, value, depth);
        }
        default:
          throw new Error(`Node type ${type} is not supported`);
      }
    });

    return result.join('\n').replaceAll('"', '');
  };

  const result = iter(1, diffNodes);

  return [
    '{',
    result,
    '}',
  ].join('\n');
};

export default stylish;
