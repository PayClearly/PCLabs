
const _tagCommit = async (delegates, config, currentBuild, appName, buildKey) => {

  // Skip if...
  if (currentBuild.tag) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return currentBuild.tag;
  }

  const buildTagPrefix = config.apps[appName].buildTagPrefix;

  console.log('Tagging commit and pushing tag to Git');
  console.log('...');
  const tagName = `${buildTagPrefix}_${buildKey}`;
  await delegates.gitSetTag(tagName);
  console.log('Successfully tagged and pushed!');

  return tagName;
};

module.exports = _tagCommit;
