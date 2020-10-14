const csv = require('csvtojson');
const writeFile = require('./utils');

module.exports = async (input, config, file, options = {}) => {
  try {
    const json = await csv().fromString(input);

    const written = writeFile(json, config, file);

    return written;
  } catch (err) {
    console.error(`Delimitator Error: '${err.message}'. Stack: '${err.stack}'`);
    return process.exit(1);
  }
};
