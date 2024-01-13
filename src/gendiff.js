import { Command } from 'commander';
import isObject from 'lodash.isobject';
import uniq from 'lodash.uniq';
import parseFiles from './parser.js';
import getFormattedDiff from './formatters/index.js';

const getDiff = (inputObj1, inputObj2) => {
  const iter = (acc, object1, object2) => {
    const keys = [...Object.keys(object1), ...Object.keys(object2)];
    const uniqueKeys = uniq(keys);

    uniqueKeys.forEach((key) => {
      const val1 = object1[key];
      const val2 = object2[key];

      // case both objects
      if (isObject(val1) && isObject(val2)) {
        acc[key] = iter({}, val1, val2);
      } else if (
        // case one object, one primitive
        (val2 !== undefined && isObject(val1) && !isObject(val2))
        || (val1 !== undefined && isObject(val2) && !isObject(val1))
      ) {
        acc.diffAddedProperties = { ...acc.diffAddedProperties, [key]: val2 };
        acc.diffRemovedProperties = { ...acc.diffRemovedProperties, [key]: val1 };
      } else if (val1 === val2) {
      // case both primitives
        acc[key] = val1;
      } else if (val1 === undefined) {
        acc.diffAddedProperties = { ...acc.diffAddedProperties, [key]: val2 };
      } else if (val2 === undefined) {
        acc.diffRemovedProperties = { ...acc.diffRemovedProperties, [key]: val1 };
      } else {
        acc.diffAddedProperties = { ...acc.diffAddedProperties, [key]: val2 };
        acc.diffRemovedProperties = { ...acc.diffRemovedProperties, [key]: val1 };
      }
    });

    return acc;
  };

  return iter({}, inputObj1, inputObj2);
};

const generateDifference = (fp1, fp2, formatType = 'stylish') => {
  const [json1, json2] = parseFiles(fp1, fp2);

  const diff = getDiff(json1, json2);

  return getFormattedDiff(diff, formatType);
};

const run = () => {
  const program = new Command();

  program
    .name('gendiff')
    .description('Compares two configuration files and shows a difference.')
    .version('1.0.0')
    .argument('<filepath1>')
    .argument('<filepath2>')
    .action((fp1, fp2) => {
      const { format } = program.opts();

      const jsonsDiff = generateDifference(fp1, fp2, format);

      console.log(jsonsDiff);
    });

  program
    .option('-f, --format <type>', 'output format', 'stylish');

  program.parse();
};

export { generateDifference };

export default run;
