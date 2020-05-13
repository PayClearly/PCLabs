const shell = require('shellpromise');
const btoa = require('btoa');

/*
  synces the lates version of the repo with the local cache
  TODO: use userpass/sshkey/token etc.. to credental the repo if necessary
*/

module.exports = (repo) => {

  const { location = './', branch = 'master', remote = null, debug = false } = repo;
  // TODO add proper validation errors

  async function sync (options = {}) {

    if (remote) {
      await _checkIfCredsAreValid(repo);
      await _cloneRepoIfDoesntExist(repo);
    }

    // TODO 
    const currentBranch = shell(`cd ${location} && git rev-parse --abbrev-ref HEAD`);
    if (currentBranch !== branch && !options.stash) {
      _log(`EXITING: you are on ${currentBranch} but the trunk branch is ${branch}`);
    }

    _log(`Stashing changes`);
    await shell(`cd ${location} && git stash`);

    await shell(`cd ${location} && git checkout ${branch}`);
    await shell(`cd ${location} && git pull`);
  }

  async function parse() {

    // get of the relevant commit data in order
    const rawCommits = (await shell(`cd ${location} && git checkout ${branch} && git log --no-decorate --topo-order --raw --pretty='format:-::::- %H -:::- %ae -:::- %at000 -:::- %P -:::- %s -:::- ' | cat && echo \n`)).split('-::::- ');

    const commits = {};
    const branches = {};
    const emails = {};
    const tags = {};

    const mapHashToCommitId = {};

    rawCommits.reverse().forEach((item, index) => {

      if (index >= rawCommits.length - 1) return;

      let [ hash, author, at, parent, message ] = item.split(' -:::- ');

      /* TODO parse files in a useful way
      files = files.split('\n').filter(item => item).map((file) => {
        const parsed = file.split(' ').slice(4, 10).join(' ');
        const action = parsed.split('\t')[0];
        const name = parsed.split('\t')[1];
        const prevname = parsed.split('\t')[2];

        if (action !== 'A' && action !== 'D' && action !== 'M') console.log(file)
        
        const id = btoa(name);
        return {
          id,
          action,
          name,
        }
      })
      */

      // console.log(files);

      const id = `c_${index}`;
      emails[btoa(author || '')] = {
        email: author
      };
      commits[id] = {
        hash,
        author,
        at,
        parents: (parent || '').split(' ').map(item => mapHashToCommitId[item]).filter(item => item),

        message: (message || ''),
        // files,
      };
      mapHashToCommitId[hash] = id;

    });

    // get all of the branches
    const rawBranches = (await shell(`cd ${location} && git branch -v -r --format='%(refname:lstrip=2) -:::- %(objectname) -:::- %(authoremail)' | cat`)).split('\n').map(item => item.trim());

    rawBranches.forEach((data) => {
      let [ name, head, author ] = data.split(' -:::- ');

      author = btoa((author || '').slice(1, -1));
      const id = btoa(name);
      branches[id] = {
        author,
        name,
        merged: !!mapHashToCommitId[head],
        commitId: mapHashToCommitId[head] || null,
      };
    });

    // get tag information
    const rawTags = (await shell(`cd ${location} && git show-ref --tags -d | cat`)).split('\n').filter(item => item);

    rawTags.forEach((data) => {
      let [ head, name ] = data.split(' ');
      name = name.split('refs/tags/')[1];
      const id = btoa(name);
      tags[id] = {
        name,
        commitId: mapHashToCommitId[head] || null,
      };
    });
    
    return {
      commits,
      tags,
      branches,
      emails,
    };
  }

  return {
    sync,
    parse,
  };

  // Private helpers

  // for managing as separate project
  async function _doesLocationExist(path) {
    return shell('ls ' + path)
      .then(() => true)
      .catch(() => false);
  }

  async function _checkIfCredsAreValid(repo) {
    _log(`TODO: Logging in...`);
  }

  async function _cloneRepoIfDoesntExist(repo){

    const location = repo.location.split('/');
    const id = location.pop();
    const dir = location.join('/');

    const dirExists = await _doesLocationExist(dir);
    if(!dirExists) {
      await shell(`mkdir ${dir}`);
    }
    const repoExists = await _doesLocationExist(repo.location);
    if(!repoExists) {
      _log(`Cloning...`);
      await shell(`cd ${dir} && git clone ${repo.remote} ${id}`);
    }
  }

  function _log(message) {
    if (!debug) return;
    console.log(`${location}: ${message}`);
  }

};
