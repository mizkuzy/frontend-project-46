#!/usr/bin/env node
import { Command } from 'commander';
import genDiff from '../src/index.js';

const program = new Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('1.0.0')
  .argument('<filepath1>')
  .argument('<filepath2>')
  .action((fp1, fp2) => {
    const { format } = program.opts();

    const jsonsDiff = genDiff(fp1, fp2, format);

    console.log(jsonsDiff);
  });

program
  .option('-f, --format <type>', 'output format', 'stylish');

program.parse();
