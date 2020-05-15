
const _deploy = async (delegates, config, currentBuild, appName, buildKey, env) => {

  const envTagPrefix = config.apps[appName].envTagPrefix;
  const envReqTagPrefix = config.apps[appName].envReqTagPrefix;
  console.log(`Checking for existing tag with prefix '${envTagPrefix}_${env}' tag for this app`);
  const matchedTag = (await delegates.gitFetchTags()).find(tag => tag.includes(`${envTagPrefix}_${env}`));

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
  await delegates.gitSetTag(tagName);
  if (envReqTagPrefix) await delegates.gitRemoveTag(`${envReqTagPrefix}_${env}`);
  console.log('Successfully tagged and pushed!');

};

module.exports = _deploy;
