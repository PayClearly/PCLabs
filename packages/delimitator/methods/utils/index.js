const fs = require('fs');
const tmp = require('tmp');

const _writeHeaderRow = ({ file, record, schema }) => {
  const line = _createLine({ record, schema, index: 1 });
  fs.appendFileSync(file, `${line}\n`);
};

const _writeRecords = ({ file, records }) => {
  records.forEach((record) => {
    fs.appendFileSync(file, record);
  });
};

const _writeFooter = ({ file, record, schema, aggregated }) => {
  const line = _createLine({ record, schema, index: aggregated['SUM'], aggregated });
  fs.appendFileSync(file, `${line}`);
};

const _validateLineCandidate = ({ field, schema, index, record, aggregated = {} }) => {
  const maxLength = schema[field];
  if (!maxLength) return ['', ''];
  let value = '';
  if (typeof record[field] === 'function') value = record[field](aggregated); else value = record[field];
  const padding = maxLength - String(value).length;
  if (!(padding >= 0)) throw new Error(`the value "${value}" in field ${field} for record ${index + 1} has exceeded the maximum length of ${maxLength} `);
  const spaces = new Array(padding + 1).join(' ');
  return [value, spaces];
};

const _createLine = ({ record, schema, index, aggregated = {} }) => {
  const line = Object.keys(record).reduce((acc, field) => {
    const [value, spaces] = _validateLineCandidate({ field, schema, index, record, aggregated });
    acc = acc.concat(value, spaces);
    return acc;
  }, `${schema['PREPEND LINE'] ? schema['PREPEND LINE'] : ''}`);
  return line;
};

const writeFile = (json, config, file, options) => {
  const { headerSchema, headerValues, footerSchema, footerValues, bodySchema } = config;

  const records = json.map((record, index) => {
    const line = _createLine({ record, schema: bodySchema, index });
    return line.concat('\n');
  });

  let fileToWriteTo;
  if (!file) {
    fileToWriteTo = tmp.fileSync().name;
  } else {
    fileToWriteTo = file;
  }

  _writeHeaderRow({ file: fileToWriteTo, record: headerValues, schema: headerSchema });
  _writeRecords({ file: fileToWriteTo, records });
  _writeFooter({ file: fileToWriteTo, record: footerValues, schema: footerSchema, aggregated: { 'SUM': records.length } });

  return fileToWriteTo;
};


module.exports = writeFile;