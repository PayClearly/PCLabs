
const _generateBuild = async (delegates, config, currentBuild, appName, buildKey, deployTo) => {

  // Skip if...
  if (currentBuild.buildKey) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return currentBuild.buildKey;
  }
  
  console.log('Generating new build (this takes approximately 30 seconds)');
  const builtAt = await config.apps[appName].build(buildKey, deployTo);

  console.log('BUILT: ', builtAt);
  return builtAt;

};

module.exports = _generateBuild;
