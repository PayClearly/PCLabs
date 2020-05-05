const shellpromise = require('shellpromise');

const _deploy = async(config, currentBuild, appName, buildKey, env) => {

  await shellpromise('git fetch --tags');

  const envTagPrefix = await config.apps[appName].envTagPrefix;
  console.log(`Checking for existing tag with prefix '${envTagPrefix}' tag for this app`);
  const matchedTag = await shellpromise(`git tag --contains HEAD`).catch(data => false).then(data => data.split('\n').find(tag => tag.includes(`${envTagPrefix}_`)));

  if (matchedTag) {
    console.log(`This build has already been deployed to ${env}`);
    return {
      tag: matchedTag,
      buildKey,
    };
  }

  console.log('running the deploy method');
  await config.apps[appName].deploy(buildKey, env);

  // delete the remote tat
  console.log('Tagging commit and pushing tag to Git');
  console.log('...');
  const tagName = `${envTagPrefix}_${env}`;
  await shellpromise(`git tag ${tagName}`);
  await shellpromise(`git push origin :${tagName}`).catch(() => {});
  await shellpromise(`git push origin ${tagName}`);
  console.log('Successfully tagged and pushed!');

};

module.exports = _deploy;
