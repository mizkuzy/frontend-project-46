import _ from 'lodash';

const getDiff = (inputObj1, inputObj2) => {
  const iter = (node1 = {}, node2 = {}) => {
    const keys = [...Object.keys(node1), ...Object.keys(node2)];
    const uniqueKeys = _.uniq(keys);

    const diff = uniqueKeys.map((key) => {
      const val1 = node1[key];
      const val2 = node2[key];

      if (_.isPlainObject(val2) && _.isPlainObject(val1)) {
        return {
          key,
          type: 'nested',
          children: iter(val1, val2),
        };
      }
      if (!_.has(node1, key)) {
        return {
          key,
          type: 'added',
          value: val2,
        };
      }

      if (!_.has(node2, key)) {
        return {
          key,
          type: 'deleted',
          value: val1,
        };
      }

      if (_.isEqual(val1, val2)) {
        return {
          key,
          type: 'unchanged',
          value: val1,
        };
      }

      return {
        key,
        type: 'changed',
        value: val2,
        oldValue: val1,
      };
    }, []);

    return _.sortBy(diff, (el) => el.key);
  };

  return iter(inputObj1, inputObj2);
};

export default getDiff;
