
const _checkForCurrentBuild = async (delegates, config, appName) => {
  console.log('NOTE: if you have uncommitted changes, they are being stashed');

  const buildTagPrefix = await config.apps[appName].buildTagPrefix;
  console.log(`Checking for existing tag with prefix '${buildTagPrefix}' tag for this app`);
  const matchedTag = (await delegates.gitFetchTags()).find(tag => tag.includes(`${buildTagPrefix}_`));

  if (matchedTag) {
    const buildKey = matchedTag.split(`${buildTagPrefix}_`)[1];
    console.log(`Tag found: ${matchedTag}`);
    console.log(`This means the commit already has a build associated with it, key: ${buildKey}`);
    return {
      tag: matchedTag,
      buildKey,
    };
  }
  return {};
};

module.exports = _checkForCurrentBuild;
