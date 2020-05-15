
const _release = async (delegates, config, currentBuild, appName, buildKey, release) => {

  if (!release) {
    console.log('skipping as release is not defined');
    return {};
  }

  const releaseTagPrefix = config.apps[appName].releaseTagPrefix;
  const releaseReqTagPrefix = config.apps[appName].releaseReqTagPrefix;
  console.log(`Checking for existing tag with prefix '${releaseTagPrefix}_${release}' tag for this app`);
  const matchedTag = (await delegates.gitFetchTags()).find(tag => tag.includes(`${releaseTagPrefix}_${release}`));

  if (matchedTag) {
    console.log(`This build has already been deployed to ${release}`);
    return {
      tag: matchedTag,
      buildKey,
    };
  }

  // delete the remote tat
  console.log('Tagging commit and pushing tag to Git');
  console.log('...');
  const tagName = `${releaseTagPrefix}_${release}`;
  await delegates.gitSetTag(tagName);

  // remove releaseReqTag
  if (releaseReqTagPrefix) await delegates.gitRemoveTag(`${releaseReqTagPrefix}_${release}`);
  console.log('Successfully tagged and pushed!');

};

module.exports = _release;
