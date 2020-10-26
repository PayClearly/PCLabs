#!/usr/bin/env node

const program = require('commander');
const pkg = require('./package.json');
const createFile = require('./methods/fromFile');
const path = require('path');

const run = (csv, config) => {
  try {
    const configObj = require(path.join(process.cwd(), config));
  
    if (!configObj.outputName) throw new Error('Must include an output file name in your config!');
  
    let fileName = `${configObj.outputName}.txt`;
    const file = path.join(process.cwd(), fileName);
    
    return createFile(csv, configObj, file, {});
  } catch (err) {
    console.error(`Delimitator Error: '${err.message}'. Stack: '${err.stack}'`);
    return process.exit(1);
  }
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