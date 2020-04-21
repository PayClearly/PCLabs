const shellpromise = require('shellpromise');

const _tagCommit = async(config, currentBuild, appName, buildKey) => {

  // Skip if...
  if (currentBuild.tag) {
    console.log('... skipped as there is already a build associated with the current HEAD');
    return currentBuild.tag;
  }

  const buildTagPrefix = config.apps[appName].buildTagPrefix;

  console.log('Tagging commit and pushing tag to Git');
  console.log('...');
  const tagName = `${buildTagPrefix}_${buildKey}`;
  await shellpromise(`git tag ${tagName}`);
  await shellpromise(`git push origin ${tagName}`);
  console.log('Successfully tagged and pushed!');

  return tagName;
};

module.exports = _tagCommit;
