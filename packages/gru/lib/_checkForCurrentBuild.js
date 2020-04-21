const shellpromise = require('shellpromise');

const _checkForCurrentBuild = async (config, appName) => {
  console.log('NOTE: if you have uncommitted changes, they are being stashed');

  // await shellpromise('git stash');
  await shellpromise('git fetch --tags');

  const buildTagPrefix = await config.apps[appName].buildTagPrefix;
  console.log(`Checking for existing tag with prefix '${buildTagPrefix}' tag for this app`);
  const matchedTag = await shellpromise(`git tag --contains HEAD`).catch(data => false).then(data => data.split('\n').find(tag => tag.includes(`${buildTagPrefix}_`)));

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
