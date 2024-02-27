import parseFiles from './parser.js';
import getDiff from './gendiff.js';
import getFormattedDiff from './formatters/index.js';

const genDiff = (fp1, fp2, formatType = 'stylish') => {
  const [json1, json2] = parseFiles(fp1, fp2);

  const diff = getDiff(json1, json2);

  return getFormattedDiff(diff, formatType);
};

export default genDiff;
