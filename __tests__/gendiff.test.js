// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDifference } from '../src/gendiff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const CASES = [['json'], ['yml'], ['yaml']];

describe.each(CASES)('gendiff for extension %s', (extension) => {
  test('stylish format plain object', () => {
    const file1Path = getFixturePath(`plain1.${extension}`);
    const file2Path = getFixturePath(`plain2.${extension}`);

    const actual = generateDifference(file1Path, file2Path, 'stylish');
    const expected = readFile('stylishPlainJsonsResult');

    expect(actual).toEqual(expected);
  });

  test('stylish format nested objects', () => {
    const file1Path = getFixturePath(`nested1.${extension}`);
    const file2Path = getFixturePath(`nested2.${extension}`);

    const actual = generateDifference(file1Path, file2Path, 'stylish');
    const expected = readFile('stylishNestedJsonsResult');

    expect(actual).toEqual(expected);
  });

  test('plain format nested objects', () => {
    const file1Path = getFixturePath(`nested1.${extension}`);
    const file2Path = getFixturePath(`nested2.${extension}`);

    const actual = generateDifference(file1Path, file2Path, 'plain');
    const expected = readFile('plainNestedJsonsResult');

    expect(actual).toEqual(expected);
  });

  test('JSON format nested objects', () => {
    const file1Path = getFixturePath(`nested1.${extension}`);
    const file2Path = getFixturePath(`nested2.${extension}`);

    const actual = generateDifference(file1Path, file2Path, 'json');
    const expected = readFile('jsonFormatResult');

    expect(actual).toEqual(expected);
  });
});
