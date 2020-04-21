#!/usr/bin/env node

const gru = require('./');
const argv = require('yargs').argv;

const instance = gru();
return instance.run(argv);
