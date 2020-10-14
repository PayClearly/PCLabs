const csv = require('csvtojson');
const writeFile = require('./utils');

module.exports = async (filePath, config, file, options = {}) => {
  try {
    console.log('LETS TRY!', filePath)
    const json = await csv().fromFile(filePath);

    const written = writeFile(json, config, file, options);

    return written;
  } catch (err) {
    console.error(`Delimitator Error: '${err.message}'. Stack: '${err.stack}'`);
    return process.exit(1);
  }
};
