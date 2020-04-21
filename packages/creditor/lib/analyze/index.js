const pathedJSON = require('../pathedJSON');
const fs = require('../fs');

function getPackage(config, toReturn) {
  toReturn.package = Object.keys(config.patterns || {})
    .reduce((acc, curr) => {
      const { plural, usage } = config.patterns[curr];
      if (curr.indexOf(':') >= 0) return acc;
      try {
        acc[usage] = require(`${config.output}/${plural}`.replace(/\/\//g, '/'));
      } catch (e) {
        acc[usage] = {};
      }
      return acc;
    }, {});
}

function getManifest(config, toReturn) {

  Object.keys(toReturn.package || {})
    .forEach((usageKey) => {

      const pattern = config._usageToPattern[usageKey];
      const plural = config.patterns[pattern].plural;

      Object.keys(pathedJSON(toReturn.package[usageKey]).toPaths() || {})
        .filter(location => location.indexOf('/__creditor/item/'))
        .filter(location => location.length)
        .map(location => location.split('/__creditor/item')[0])
        .forEach((location) => {

          const path = `/${plural}/${location}/`.replace(/\/{2,}/g, '/');
          const usage = `${usageKey}/${location}`.replace(/\/{2,}/g, '/').replace(/\//g, '.');
          const name = `${plural}/${location}`.replace(/\/{2,}/g, '/').replace(/\//g, '_');

          const data = {
            pattern,
            path,
            usage,
            name,
          };

          toReturn.byPath[path] = data;
          toReturn.byUsage[usage] = data;
          toReturn.byName[name] = data;

        });
    });

  return toReturn;
}

function getUsage(config, toReturn) {


  [
    config.rel,
    '/creditor/patterns',
  ].forEach((rel) => {
    const filePaths = fs.allDirectories(`${config.cwd}${rel}`, item => item.type === 'file').map(item => item.slice(0, -1));
    filePaths.forEach((pathpart) => {
      const contents = fs.readFileSync(`${config.cwd}${rel}${pathpart}`).toString();
      const path = `${config.cwd}${rel}${pathpart}`.split(config.cwd)[1];
      return Object.keys(config.patterns || {})
        .forEach((pattern) => {
          (contents.match(new RegExp(`${config.patterns[pattern].usage}.[a-zA-Z]{1,}(?:.[a-zA-Z]{1,})*`, 'g')) || [])
            .map((match) => {
              // check up two layers if it is one used
              if (toReturn.byUsage[match]) return match;
              if (toReturn.byUsage[match.split('.').slice(0, -1).join('.')]) return match.split('.').slice(0, -1).join('.');
              if (toReturn.byUsage[match.split('.').slice(0, -2).join('.')]) return match.split('.').slice(0, -2).join('.');

              toReturn.orphaned[match] = { ...toReturn.isUsedBy[match], [path]: true };
         
            })
            .filter(match => match && match.split('.').length > 1)
            .forEach((match) => {
              toReturn.isUsedBy[match] = { ...toReturn.isUsedBy[match], [path]: true };
              toReturn.fileUses[path] = { ...toReturn.fileUses[path], [match]: true };
            });
        });
    });
  });

  return toReturn;
}

module.exports = (config) => {
  const toReturn = {
    // All items as the would be exported
    package: {},
    // Manifest
    byPath: {},
    byUsage: {},
    byName: {},
    // Usage Items
    isUsedBy: {},
    fileUses: {},
    orphaned: {},
  };
  getPackage(config, toReturn);
  getManifest(config, toReturn);
  getUsage(config, toReturn);

  return toReturn;
};
