import { Command } from 'commander';
import parseFiles from './parser.js';

const program = new Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('1.0.0')
  .argument('<filepath1>')
  .argument('<filepath2>')
  .action((fp1, fp2) => {
    const jsons = parseFiles(fp1, fp2);

    console.log(jsons);
  });

program
  .option('-f, --format <type>', 'output format');

program.parse();
