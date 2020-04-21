const _uploadToStorage = async(config, currentBuild, appName, buildKey) => {

  // Skip if...
  if (currentBuild.buildKey) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return;
  }

  // TODO use tmp dir util
  const destination = await config.apps[appName].cache(buildKey, `${__dirname}/../.temp/${appName}_${buildKey}_build.zip`);

  console.log('Successfully uploaded to: ', destination);
};

module.exports = _uploadToStorage;
