import _ from 'lodash';

const formatValue = (value) => {
  if (_.isPlainObject(value)) {
    return '[complex value]';
  }

  if (typeof value === 'string') {
    return `'${value}'`;
  }

  return value;
};

const createLine = (property, type, from, to) => {
  const fromValToPrint = formatValue(from);
  const toValToPrint = formatValue(to);

  switch (type) {
    case 'added':
      return `Property '${property}' was added with value: ${toValToPrint}`;
    case 'deleted':
      return `Property '${property}' was removed`;
    case 'changed':
      return `Property '${property}' was updated. From ${fromValToPrint} to ${toValToPrint}`;
    default:
      throw new Error('Node type is not supported');
  }
};

const plain = (diffNodes) => {
  const iter = (
    parentPropNames,
    diffNodesInner,
  ) => {
    const nodesSorted = _.sortBy(diffNodesInner, (el) => el.key);

    return nodesSorted.reduce((acc, {
      key, type, value, oldValue, children,
    }) => {
      if (type === 'unchanged') {
        return acc;
      }

      const propPath = [...parentPropNames, key].join('.');

      if (type === 'nested') {
        const innerLines = iter([...parentPropNames, key], children);

        return [
          ...acc, ...innerLines,
        ];
      }

      return [
        ...acc, createLine(propPath, type, oldValue, value),
      ];
    }, []);
  };

  const result = iter([], diffNodes);

  return result.join('\n');
};

export default plain;
