const inquirer = require('inquirer');

const _checkForCurrentBuild = require('./lib/_checkForCurrentBuild');
const _generateBuildKey = require('./lib/_generateBuildKey');
const _generateBuild = require('./lib/_generateBuild');
const _archiveBuild = require('./lib/_archiveBuild');
const _uploadToStorage = require('./lib/_uploadToStorage');
const _tagCommit = require('./lib/_tagCommit');
const _release = require('./lib/_release');
const _deploy = require('./lib/_deploy');

module.exports = (options, _delegates) => {
  
  const config = options || require(`${process.cwd()}/.gruconfig.js`);
  const delegates = _delegates || require(`./lib/delegates.js`);

  return {
    run: async (givenAnswers = {}) => {
      // step 1: Make sure all options were given
      console.log('\x1b[35m%s\x1b[0m', `\nStep 1: Inquire for needed information`);
      const { app, cache, deployTo, release } = await _determineParametersToUse(givenAnswers, config);

      // step 2: Check git for current tags to make sure a build doesn't already exist for this
      console.log('\x1b[35m%s\x1b[0m', `\nStep 2: Stashing unsaved changes and checking for existing build`);
      const currentBuild = await _checkForCurrentBuild(delegates, config, app).then(data => data || {});
      const buildKey = currentBuild.buildKey || _generateBuildKey(delegates, config);

      // step 3: have webpack build code -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 3: Generate build for deploy`);
      const buildLocation = await _generateBuild(delegates, config, currentBuild, app, buildKey, deployTo);

      // step 4: archive -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 4: Archive build folder`);
      const archiveLocation = await _archiveBuild(delegates, config, currentBuild, buildLocation);

      if (!cache) {
        console.log('\x1b[35m%s\x1b[0m', `\nDONE: the code was only build locally ${{ buildKey }}\n `);
        return { buildKey, tag: undefined };
      }

      // step 5: push to bucket -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 5: Cache build`);
      await _uploadToStorage(delegates, config, currentBuild, app, buildKey, archiveLocation);

      // step 6: tag commit with new build -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 6: Tag commit with build key`);
      const tag = await _tagCommit(delegates, config, currentBuild, app, buildKey);

      // step 6: tag commit with new build -- will skip if there is a current build
      console.log('\x1b[35m%s\x1b[0m', `\nStep 7: Tag commit with release key`);
      await _release(delegates, config, currentBuild, app, buildKey, release);

      if (!deployTo) {
        console.log('\x1b[35m%s\x1b[0m', `\nDONE: code is in destination: ${{ buildKey, tag }}\n `);
        return { buildKey, tag };
      }

      // step 8: deploy code to desired environment
      console.log('\x1b[35m%s\x1b[0m', `\nStep 8: Deploying code`);
      await _deploy(delegates, config, currentBuild, app, buildKey, deployTo);
      console.log('\x1b[35m%s\x1b[0m', `\nDONE: the code has been build and deployed ${{ buildKey, tag, env: deployTo }}\n `);
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
  let release = args.release;

  if (args.custom) {
    // if a custom string was given... do not inquire
    const fromCustom = config.customParser && args.custom && config.customParser(args.custom) || {};
    app = fromCustom.app || app;
    cache = fromCustom.cache || cache;
    deployTo = fromCustom.deployTo || deployTo;
    release = fromCustom.release || release;
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
    release = fromInquires.release || release;
  }

  if (!validApps.some(validApp => validApp === app)) throw (`The appName given (${app}) is not valid`);
  
  return {
    app,
    cache,
    deployTo,
    release,
  };

}
