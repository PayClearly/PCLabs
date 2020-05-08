const _archiveBuild = async (delegates, config, currentBuild, buildDestination) => {

  // Skip if...
  if (currentBuild.buildKey) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return;
  }

  return delegates.archive(buildDestination);

};

module.exports = _archiveBuild;
