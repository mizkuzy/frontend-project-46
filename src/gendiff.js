import { Command } from 'commander';
import parseFiles from './parser.js';
import formatDiff from './formatter.js';

const getDiff = (object1, object2) => {
  const keys = [...Object.keys(object1), ...Object.keys(object2)];

  const result = {};

  keys.forEach((key) => {
    const val1 = object1[key];
    const val2 = object2[key];

    if (val1 === val2) {
      result[key] = val1;
    } else if (val1 === undefined) {
      result.diffAddedValues = { ...result.diffAddedValues, [key]: val2 };
    } else if (val2 === undefined) {
      result.diffRemovedValues = { ...result.diffRemovedValues, [key]: val1 };
    } else {
      result.diffAddedValues = { ...result.diffAddedValues, [key]: val2 };
      result.diffRemovedValues = { ...result.diffRemovedValues, [key]: val1 };
    }
  });

  return result;
};

const generateDifference = (fp1, fp2, formatType = 'stylish') => {
  const [json1, json2] = parseFiles(fp1, fp2);

  const diff = getDiff(json1, json2);

  return formatDiff(diff, formatType);
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
