import path from 'path';
import { readFileSync } from 'fs';

const parseFile = (filePath) => {
  const fp = path.resolve(filePath);
  const objAsString = readFileSync(fp, { encoding: 'utf8', flag: 'rs' });

  return JSON.parse(objAsString);
};

const parseFiles = (...args) => args.map(parseFile);

export default parseFiles;
