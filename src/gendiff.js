import _ from 'lodash';

const getDiff = (inputObj1, inputObj2) => {
  const iter = (node1 = {}, node2 = {}) => {
    const keys = [...Object.keys(node1), ...Object.keys(node2)];
    const uniqueKeys = _.uniq(keys);

    return uniqueKeys.reduce((acc, key) => {
      const val1 = node1[key];
      const val2 = node2[key];

      if (_.isPlainObject(val2)) {
        return [
          ...acc, {
            key,
            type: 'nested',
            children: iter(val1, val2),
          },
        ];
      }
      if (!_.has(node1, key)) {
        return [
          ...acc, {
            key,
            type: 'added',
            value: val2,
          },
        ];
      }

      if (!_.has(node2, key)) {
        return [
          ...acc, {
            key,
            type: 'deleted',
            value: val1,
          },
        ];
      }

      if (val1 === val2) {
        return [
          ...acc, {
            key,
            type: 'unchanged',
            value: val1,
          },
        ];
      }

      return [
        ...acc, {
          key,
          type: 'changed',
          value: val2,
          oldValue: val1,
        },
      ];
    }, []);
  };

  return iter(inputObj1, inputObj2);
};

export default getDiff;
