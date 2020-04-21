const gitit = require('../');

const config = {
  repo: {
    service: 'github',
    name: 'PayClearly/app',
    branch: 'develop', // the branch of interest
    creds: {}, // TODO
    entryParser: {}, // FUTURE
  },
  project: {
    name: 'PayClearly Frontend',
    entry: '', // FUTURE -- limits what this project cares about to only the commits that belong to it
    // the folloing use the following capture group names
    // NOTE that the newest commit is always what is used for these
    //   prId: the id associated with a pr
    //   releaseId: the id of the release.. may correspond to semver
    //   wipId: ticket ids corresponding to unmerged trunk branch ticket ids
    //   ticketId: ids corresponding to merged ticked ids.
    //   buildId: id corresponding to a build number if applicable
    commitParsers: [/Merge pull request #(:<prId>[0-9]{1,7}) from PayClearly\/(:<ticketId>PC-[0-9]{1,7})/],  // parses commit messages to find the above
    branchParsers: [/\/(:<wipId>PC-[0-9]{1,7})$/], // parses branch names to find the above
    tagParsers: [/build-app_(:<buildId>[0-9]{10,15})$/], // parses branch names to find the above
  },
  tickets: {
    // TODO allow the definition of a tickets structure
  },
};

const instance = gitit(config);

instance.parseRepo({})
  .then((repoData) => {
    return instance.parseProject(repoData);
  })
  .then((data) => {
    console.log(data);
  });
