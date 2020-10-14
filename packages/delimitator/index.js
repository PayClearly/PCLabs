#!/usr/bin/env node

const program = require('commander');
const pkg = require('./package.json');
const createFile = require('./methods/fromFile');
const path = require('path');

const run = (csv, config) => {
  const configObj = require(path.join(process.cwd(), config));

  let fileName = `${configObj.outputName}.txt`;
  const file = path.join(process.cwd(), fileName);
  
  return createFile(csv, configObj, file, {});
};

program
  .version(pkg.version)
  .arguments('<csv> <config>')
  .description('A CLI program for generating fixed width files from CSV')
  .on('--help', function () {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('types: account, certificate');
    console.log('');
    console.log('  $ delimitator your_csv.csv your_config.js');
  })
  .action(run);

program.parseAsync(process.argv);

module.exports = run;