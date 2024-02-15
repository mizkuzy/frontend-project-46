import path from 'path';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';

const parseFile = (filePath) => {
  const extension = path.extname(filePath);

  const fp = path.resolve(filePath);
  const objAsString = readFileSync(fp, { encoding: 'utf8', flag: 'rs' });

  switch (extension) {
    case '.json':
      return JSON.parse(objAsString);
    case '.yml':
    case '.yaml':
      return yaml.load(objAsString);
    default:
      throw new Error(`Unsupported extension ${extension}`);
  }
};

const parseFiles = (file1, file2) => [parseFile(file1), parseFile(file2)];

export default parseFiles;
