const fs = require('fs-extra');

const _generateBuild = async(config, currentBuild, appName, buildKey) => {

  // Skip if...
  if (currentBuild.buildKey) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return currentBuild.buildKey;
  }
  
  console.log('Generating new build (this takes approximately 30 seconds)');
  const buildAt = await config.apps[appName].build(buildKey);
  console.log('BUILT: ', buildAt);

  // check that the build was successfully outputted to build directory
  if (!fs.pathExistsSync(buildAt)) {
    throw ('Did not successfully generate build for app');
  }

  console.log('Successfully generated build!');
};

module.exports = _generateBuild;
