import { Command } from 'commander';
import sortBy from 'lodash.sortby';
import uniq from 'lodash.uniq';
import parseFiles from './parser.js';

const append = (key, value, differenceSign) => (differenceSign ? `${differenceSign} ${key}: ${value}\n` : `${key}: ${value}\n`);

const getDiff = (object1, object2) => {
  const keys = [...Object.keys(object1), ...Object.keys(object2)];
  const uniqueKeys = uniq(keys);
  const sortedUniqueKeys = sortBy(uniqueKeys);

  let result = '{\n';

  for (const key of sortedUniqueKeys) {
    const val1 = object1[key];
    const val2 = object2[key];

    if (val1 === val2) {
      result += append(key, val1);
    } else if (val1 === undefined) {
      result += append(key, val2, '+');
    } else if (val2 === undefined) {
      result += append(key, val1, '-');
    } else {
      result += append(key, val1, '-');
      result += append(key, val2, '+');
    }
  }

  result += '}';

  return result;
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
      const [json1, json2] = parseFiles(fp1, fp2);
      const jsonsDiff = getDiff(json1, json2);

      console.log(jsonsDiff);
    });

  program
    .option('-f, --format <type>', 'output format');

  program.parse();
};

export default run;
