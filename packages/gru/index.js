const inquirer = require('inquirer');

const _checkForCurrentBuild = require('./lib/_checkForCurrentBuild');
const _generateBuildKey = require('./lib/_generateBuildKey');
const _generateBuild = require('./lib/_generateBuild');
const _archiveBuild = require('./lib/_archiveBuild');
const _uploadToStorage = require('./lib/_uploadToStorage');
const _tagCommit = require('./lib/_tagCommit');
const _deploy = require('./lib/_deploy');

module.exports = () => {
  
  const config = require(`${process.cwd()}/.gruconfig.js`);

  return {
    run: async (givenAnswers = {}) => {
      // step 1: Make sure all options were given
      console.log('\x1b[35m%s\x1b[0m', `\nStep 1: Inquire for needed information`);
      const { app, cache, deployTo } = await _determineParametersToUse(givenAnswers, config);

      // step 2: Check git for current tags to make sure a build doesn't already exist for this
      console.log('\x1b[35m%s\x1b[0m', `\nStep 2: Stashing unsaved changes and checking for existing build`);
      const currentBuild = await _checkForCurrentBuild(config, app).then(data => data || {});
      const buildKey = currentBuild.buildKey || _generateBuildKey(config);

      // step 3: have webpack build code -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 3: Generate build for deploy`);
      await _generateBuild(config, currentBuild, app, buildKey);

      // step 4: archive -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 4: Archive build folder`);
      await _archiveBuild(config, currentBuild, app, buildKey);

      if (!cache) {
        console.log('\x1b[35m%s\x1b[0m', `\nDONE: the code was only build locally ${{ buildKey }}\n `);
        return { buildKey, tag: undefined };
      }

      // step 5: push to bucket -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 5: Cache build`);
      await _uploadToStorage(config, currentBuild, app, buildKey);

      // step 6: tag commit with new build -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 6: Tag commit with build key`);
      const tag = await _tagCommit(config, currentBuild, app, buildKey);

      if (!deployTo) {
        console.log('\x1b[35m%s\x1b[0m', `\nDONE: code is in destination: ${{ buildKey, tag }}\n `);
        return { buildKey, tag };
      }

      // step 7: deploy code to desired environment
      console.log('\x1b[35m%s\x1b[0m', `\nDONE: the code has been build and deployed ${{ buildKey, tag, env: deployTo }}\n `);
      await _deploy(config, currentBuild, app, buildKey, deployTo);
      return { buildKey, tag };
    },
  };
};

// private helpers

async function _determineParametersToUse(args, config) {

  const validApps = Object.keys(config.apps || {});

  let app = args.app;
  let cache = args.cache === 'true';
  let deployTo = args.deployTo;

  if (args.custom) {
    // if a custom string was given... do not inquire
    const fromCustom = config.customParser && args.custom && config.customParser(args.custom) || {};
    app = fromCustom.app || app;
    cache = fromCustom.cache || cache;
    deployTo = fromCustom.deployTo || deployTo;
  } else {
    // else inquire for additional needed information
    const possibleInquires = {
      app: {
        type: 'list',
        name: 'app',
        message: 'Which app do you want to build?',
        choices: validApps,
        default: 'app',
      },
      cache: {
        type: 'confirm',
        name: 'cache',
        message: `Would you like to cache this app and tag the repo?`,
      }
    };

    const inquiries = [];
    if (!app) inquiries.push(possibleInquires.app);
    if (!cache) inquiries.push(possibleInquires.cache);

    const fromInquires = await inquirer.prompt(inquiries);
    app = fromInquires.app || app;
    cache = fromInquires.cache || app;
    deployTo = fromInquires.deployTo || deployTo;
  }

  if (!validApps.some(validApp => validApp === app)) throw (`The appName given (${app}) is not valid`);
  
  return {
    app,
    cache,
    deployTo,
  };

}
