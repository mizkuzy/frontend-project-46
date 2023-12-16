// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDifference } from '../src/gendiff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const cases = [['json'], ['yml'], ['yaml']];

describe.each(cases)('gendiff for extension %s', (extension) => {
  test('plain object', () => {
    const file1Path = getFixturePath(`plain1.${extension}`);
    const file2Path = getFixturePath(`plain2.${extension}`);

    const actual = generateDifference(file1Path, file2Path);
    const expected = fs.readFileSync(getFixturePath('plainJsonsResult'), 'utf-8');

    expect(actual).toEqual(expected);
  });
});
