// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDifference } from '../src/gendiff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

test('gendiff', () => {
  const file1Path = getFixturePath('plain1.json');
  const file2Path = getFixturePath('plain2.json');

  const actual = generateDifference(file1Path, file2Path);
  const expected = fs.readFileSync(getFixturePath('plainJsonsResult'), 'utf-8');

  expect(actual).toEqual(expected);
});
