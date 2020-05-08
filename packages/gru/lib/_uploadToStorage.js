const _uploadToStorage = async (delegates, config, currentBuild, appName, buildKey, archiveLocation) => {

  // Skip if...
  if (currentBuild.buildKey) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return;
  }

  const destination = await config.apps[appName].cache(buildKey, archiveLocation);

  console.log('Successfully uploaded to: ', destination);

  return destination;
};

module.exports = _uploadToStorage;
