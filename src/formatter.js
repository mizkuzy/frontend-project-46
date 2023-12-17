import uniq from 'lodash.uniq';
import sortBy from 'lodash.sortby';

const createLine = (key, value, differenceSign) => (differenceSign ? `${differenceSign} ${key}: ${value}` : `${key}: ${value}`);

const getStyledDiff = ({ diffAddedValues, diffRemovedValues, ...rest }) => {
  const keys = [
    ...Object.keys(diffAddedValues),
    ...Object.keys(diffRemovedValues),
    Object.keys(rest)];
  const uniqueKeys = uniq(keys);
  const sortedUniqueKeys = sortBy(uniqueKeys);

  const lines = [];

  sortedUniqueKeys.forEach((key) => {
    if (Object.hasOwn(rest, key)) {
      lines.push(createLine(key, rest[key]));
      return;
    }

    const isValueAdded = Object.hasOwn(diffAddedValues, key);
    const isValueRemoved = Object.hasOwn(diffRemovedValues, key);

    const isValueUpdated = isValueAdded && isValueRemoved;

    if (isValueUpdated) {
      lines.push(createLine(key, diffRemovedValues[key], '-'));
      lines.push(createLine(key, diffAddedValues[key], '+'));
      return;
    }

    if (isValueAdded) {
      lines.push(createLine(key, diffAddedValues[key], '+'));
      return;
    }

    if (isValueRemoved) {
      lines.push(createLine(key, diffRemovedValues[key], '-'));
    }
  });

  return [
    '{',
    ...lines,
    '}',
  ].join('\n');
};

const formatDiff = (diff, type) => {
  if (type === 'stylish') {
    return getStyledDiff(diff);
  }

  return 'u r default';
};

export default formatDiff;
