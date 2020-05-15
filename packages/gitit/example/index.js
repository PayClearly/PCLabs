const gitit = require('../');

// Example config of how payclearly uses Gitit to manage releases
const config = {
  repo: {
    remote: 'git@github.com:PayClearly/app.git', // options for pulling a remote
    location: './.temp/PCApp',
    branch: 'develop', // the branch of interest
    creds: {}, // FUTURE
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
    //   envId: id representing the environment it is assocated with
    //   envreqId: id representing an env request it is assocated with // TODO
    //   releaseRequestId: id representing a releaseRequest // TODO
    commitParsers: [/Merge pull request #(:<prId>[0-9]{1,7}) from PayClearly\/(:<ticketId>PC-[0-9]{1,7})/],  // parses commit messages to find the above
    branchParsers: [/\/(:<wipId>PC-[0-9]{1,7})$/], // parses branch names to find the above
    tagParsers: [
      /build_app_(:<buildId>[0-9]{10,15})$/,
      /env_(:<envId>[A-Za-z]{2,10}_[A-Za-z]{2,15})$/,
      /release_(:<releaseId>[A-Za-z]{2,10}_[v.a-z0-9]{2,15})$/,
      /envreq_(:<envReqId>[A-Za-z]{2,10}_[a-z0-9_]{2,30})$/,
      /releasereq_(:<releaseReqId>[A-Za-z]{2,10}_[a-z0-9_]{2,20})$/,
    ], // parses branch names to find the above },
  },
  tickets: {
    // TODO allow the definition of a tickets structure
  },
  delegates: {
    onAnswers: async (answers) => {
      console.log('answers', answers);
    }
  }
};

const instance = gitit(config);
const options = {};

instance.prompt(options, {});
