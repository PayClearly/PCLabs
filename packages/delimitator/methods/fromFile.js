const csv = require('csvtojson');
const writeFile = require('./utils');

module.exports = async (filePath, config, file, options = {}) => {
  try {
    const json = await csv().fromFile(filePath);

    const written = writeFile(json, config, file, options);

    return written;
  } catch (err) {
    const error = `Delimitator Error: '${err.message}'. Stack: '${err.stack}'`;
    throw new Error(error);
  }
};
