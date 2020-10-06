#!/usr/bin/env node

const csv = require('csvtojson');
const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs-extra');
const path = require('path');

const schema = [{
  'field1': 1,
  'field2': 6,
  'field3': 50,
  'field4': 50,
  'field5': 8,
  'field6': 8,
}, {
  'field1': 1,
  'field2': 25,
  'field3': 25,
  'field4': 50,
  'field5': 50,
  'field6': 100,
  'field7': 100,
  'field8': 50,
  'field9': 2,
  'field10': 9,
  'field11': 3,
  'field12': 3,
  'field13': 9,
  'field14': 50,
  'field15': 5,
  'field16': 10,
  'field17': 10,
  'field18': 50,
  'field19': 50,
  'field20': 50,
  'field21': 10,
  'field22': 10,
  'field23': 10,
  'field24': 10,
  'field25': 50,
  'field26': 1,
  'field27': 50,
  'field28': 50,
  'field29': 50,
  'field30': 100,
  'field31': 100,
  'field32': 50,
  'field33': 2,
  'field34': 9,
  'field35': 3,
  'field36': 50,
  'field37': 100,
  'field38': 100,
  'field39': 50,
  'field40': 2,
  'field41': 9,
  'field42': 15,
  'field43': 30,
  'field44': 15,
  'field45': 3,
  'field46': 15,
  'field47': 1,
  'field48': 1,
  'field49': 3,
  'field50': 50,
  'field51': 6,
  'field52': 1,
  'field53': 1,
  'field54': 1,
  'field55': 15,
  'field56': 100,
  'field57': 50,
  'field58': 9,
  'field59': 10,
  'field60': 30,
}, {
  'field1': 1,
  'field2': 7,
  'field3': 9,
}];

const run = async (filePath) => {
  try {
    const json = await csv({ noheader: true}).fromFile(filePath);
    const records = json.map((record, index) => {
      const line = Object.keys(record).reduce((acc, field) => {
        const maxLength = schema[index][field];
        if (!maxLength) return acc;
        const value = record[field] || '';
        const padding = maxLength - value.length;
        if (!(padding >= 0)) throw new Error(`the value "${value}" in field ${field} for record ${index + 1} has exceeded the maximum length of ${maxLength} `)
        const spaces = new Array(padding + 1).join(' ');
        acc = acc.concat(value, spaces);
        console.log(acc, acc.length);
        return acc;
      }, '');
      debugger
      return line.trim().concat('\n');
    });
    const baseFilePath = filePath.split('/').filter(fd => !fd.includes('.csv')).join('/');
    const file = path.join(baseFilePath, 'CDD_EDD_PC.txt');
    fs.ensureFileSync(file);

    return records.reduce((acc, record) => {
      acc.then(async () => await _appendFile(file, record));
      return acc;
    }, Promise.resolve());
    return process.exit(0)
  } catch (err) {
    console.error(`Delimitator Error: '${err.message}'. Stack: '${err.stack}'`);
    return process.exit(1)
  }
};

const _appendFile = (file, record) => {
  new Promise((resolve, reject) => {
    fs.appendFile(file, record, function (err) {
      if (err) return reject(err);
      return resolve()
    })
  })
}

program
  .version(pkg.version)
  .arguments('<path>')
  .description('An ACME client for managing accounts and ssl certificates with Let\'s Encrypt certificate authority.')
  .on('--help', function() {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('types: account, certificate');
    console.log('');
    console.log('  $ certificator create account');
    console.log('  $ certificator create certificate');
  })
  .action(run);

program.parseAsync(process.argv);

