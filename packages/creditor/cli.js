#!/usr/bin/env node

const argv = require('yargs').argv;
const gru = _tryRequire('@pclabs/gru') || _tryRequire('./');

const instance = gru();
return instance.run(argv);

function _tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return undefined;
  }
}