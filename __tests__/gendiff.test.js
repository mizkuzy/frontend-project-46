// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDifference } from '../src/gendiff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const cases = [['json'], ['yml'], ['yaml']];

describe.each(cases)('gendiff for extension %s', (extension) => {
  test('plain object', () => {
    const file1Path = getFixturePath(`plain1.${extension}`);
    const file2Path = getFixturePath(`plain2.${extension}`);

    const actual = generateDifference(file1Path, file2Path);
    const expected = readFile('plainJsonsResult');

    expect(actual).toEqual(expected);
  });

  test('nested object', () => {
    const file1Path = getFixturePath(`nested1.${extension}`);
    const file2Path = getFixturePath(`nested2.${extension}`);

    const actual = generateDifference(file1Path, file2Path);
    const expected = readFile('nestedJsonsResult');

    expect(actual).toEqual(expected);
  });
});
