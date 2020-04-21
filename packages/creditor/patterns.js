const lib = require('./lib');
const config = lib.utils.buildConfig();

const patterns = Object.keys(config._usageToPattern)
  .reduce((acc, usage) => {

    const pattern = config._usageToPattern[usage];
    const plural = config.patterns[pattern].plural;

    try {
      acc[usage] = _nestedExporter((require.context || require('require-context'))(`${config.output}/${plural}`, true, /\.js$/));
    } catch (e) {
      acc[usage] = {};
    }

    return acc;
  }, {});

module.exports = patterns;

// helper nested exporter
function _nestedExporter(context) {
  const structure = {};
  (context || {})
    .keys()
    .forEach((key) => {
      const keysSplit = key.split('/');
      const name = keysSplit[keysSplit.length - 2];

      if (!name || name === '.') return; // return if does not match structure
      const defaultMod = keysSplit.filter((key) => {
        return key.indexOf('.') < 0;
      });

      const mod = context(key);

      const toPush = mod.default || mod;
      toPush.__creditor = { item: true };
      defaultMod.push(toPush);

      _patchDeep(structure, ...defaultMod);
    });
  return structure;
}

function _patchDeep(toSet, ...rest) {
  if (rest.length <= 2) {
    const current = toSet[rest[0]];
    if (current) {
      toSet[rest[0]] = rest[1];
      Object.keys(current).forEach(key => toSet[rest[0]][key] = current[key]);
    } else {
      toSet[rest[0]] = rest[1];
    }
  } else {
    toSet[rest[0]] = toSet[rest[0]] || { };
    _patchDeep(toSet[rest[0]], ...rest.slice(1));
  }
}
