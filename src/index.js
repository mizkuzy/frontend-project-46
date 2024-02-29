import parseData from './parser.js';
import getDiff from './gendiff.js';
import getFormattedDiff from './formatters/index.js';
import { getExtension, readFile } from './file.util.js';

const genDiff = (fp1, fp2, formatType = 'stylish') => {
  const fileData1 = readFile(fp1);
  const fileData2 = readFile(fp2);

  const fileDataExt1 = getExtension(fp1);
  const fileDataExt2 = getExtension(fp1);

  const json1 = parseData(fileData1, fileDataExt1.toUpperCase());
  const json2 = parseData(fileData2, fileDataExt2.toUpperCase());

  const diff = getDiff(json1, json2);

  return getFormattedDiff(diff, formatType);
};

export default genDiff;
