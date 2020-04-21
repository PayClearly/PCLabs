#!/usr/bin/env node

const creditor = require('./');
const argv = require('yargs').argv;

const instance = creditor();

return instance.prompt(argv).then((answers) => {
  return instance.perform(answers);
});
