
const _deploy = async (delegates, config, currentBuild, appName, buildKey, env) => {

  const envTagPrefix = await config.apps[appName].envTagPrefix;
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
  console.log('Successfully tagged and pushed!');

};

module.exports = _deploy;
