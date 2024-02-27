import { readFileSync } from 'fs';
import * as path from 'path';

const readFile = (filePath) => {
  const fp = path.resolve(filePath);

  return readFileSync(fp, { encoding: 'utf8', flag: 'rs' });
};

const getExtension = (filePath) => {
  const ext = path.extname(filePath);
  return ext.slice(1);
};

export {
  readFile,
  getExtension,
};
