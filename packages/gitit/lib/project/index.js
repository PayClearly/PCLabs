const btoa = require('btoa');
const NamedRegExp = require('named-regexp-groups');

module.exports = (config) => {

  const regexGroupKeys = { prId: 'null', releaseId: null, buildId: null, wipId: null, ticketId: null };

  return {
    parse: async (repoData) => {
      const { commits, branches, tags } = repoData;

      const toReturn = {};

      // add info found in commits
      Object.keys(commits || {})
        .forEach((commitId) => {
          const commit = commits[commitId];
          const { branchId, tagId } = commit;
          const matches = runRegex(config.commitParsers || [], commit.message);
          addToToReturn(toReturn, matches, { commitId, branchId, tagId });
        });

      // add info found in branches
      Object.keys(branches || {})
        .forEach((branchId) => {
          const branch = branches[branchId];
          const { commitId, tagId } = branch;
          const matches = runRegex(config.branchParsers || [], branch.name);
          addToToReturn(toReturn, matches, { commitId, branchId, tagId });
        });

      // add info found in tags
      Object.keys(tags || {})
        .forEach((tagId) => {
          const tag = tags[tagId];
          const { commitId, branchId } = tag;
          const matches = runRegex(config.tagParsers || [], tag.name);
          addToToReturn(toReturn, matches, { commitId, branchId, tagId });
        });

      return toReturn;
    },
  };

  // helpers
  function runRegex(regexes, on) {
    return regexes.reverse().reduce((acc, regex) => {
      const matches = (new NamedRegExp(regex)).exec(on);
      const groups = (matches && matches.groups) || {};
      return {
        ...acc,
        ...groups,
      };
    }, regexGroupKeys);
  }

  function addToToReturn(toReturn, matches, data) {
    Object.keys(regexGroupKeys).forEach((regexGroupKey) => {
      if (matches[regexGroupKey]) {
        toReturn[`${regexGroupKey.slice(0, -2)}s`] = toReturn[`${regexGroupKey.slice(0, -2)}s`] || {};
        toReturn[`${regexGroupKey.slice(0, -2)}s`][btoa(matches[regexGroupKey])] = [ 'commitId', 'branchId', 'tagId' ]
          .reduce((acc, item) => {
            const val = data[item];
            const old = (toReturn[`${regexGroupKey.slice(0, -2)}s`][btoa(matches[regexGroupKey])] && toReturn[`${regexGroupKey.slice(0, -2)}s`][btoa(matches[regexGroupKey])][item]);
            acc = { ...acc, [item]: largeest(val || old)};
            return acc;
          }, {});
      }
    });

    function largeest(a, b) {
      if (a && b) {
        if (a > b) return a;
        return b;
      }
      return a || b || null;
    }
  }

};
