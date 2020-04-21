const shell = require('shellpromise');
const btoa = require('btoa');

/*
  synces the lates version of the repo with the local cache
  TODO: use userpass/sshkey/token etc.. to credental the repo if necessary
*/

const serviceToHost = {
  github: 'github.com',
};

module.exports = (repo) => {

  const { name, branch, service } = repo;
  // TODO add proper validation errors

  const repoLocation = `git@${serviceToHost[service.toLowerCase()]}:${name}.git`;
  const id = btoa(repoLocation);

  async function sync () {
    await _checkIfCredsAreValid(repoLocation, repo);
    await _cloneRepoIfDoesntExist(id, repo);
    _log(`Updating ${branch}...`);
    await shell(`cd ./.temp/${id} && git reset --hard ${branch} && git checkout ${branch}`);
    await shell(`cd ./.temp/${id} && git pull`);
  }

  async function parse() {

    // get of the relevant commit data in order
    const rawCommits = (await shell(`cd ./.temp/${id} && git reset --hard ${branch} && git checkout ${branch} && git log --no-decorate --topo-order --raw --pretty='format:-::::- %H -:::- %ae -:::- %at000 -:::- %P -:::- %s -:::- ' | cat && echo \n`)).split('-::::- ');

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
    const rawBranches = (await shell(`cd ./.temp/${id} && git branch -v -r --format='%(refname:lstrip=2) -:::- %(objectname) -:::- %(authoremail)' | cat`)).split('\n').map(item => item.trim());

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
    const rawTags = (await shell(`cd ./.temp/${id} && git show-ref --tags -d | cat`)).split('\n').filter(item => item);

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
  async function _cloneRepoIfDoesntExist(id, repo){
    const dirExists = await _doesLocationExist('./.temp');
    if(!dirExists) {
      await shell('mkdir ./.temp');
    }
    const repoExists = await _doesLocationExist('./.temp/' + id);
    if(!repoExists) {
      _log(`Cloning...`);
      await shell('cd ./.temp && git clone ' + repoLocation + ' ' + id);
    }
  }

  async function _doesLocationExist(path) {
    return shell('ls ' + path)
      .then(() => true)
      .catch(() => false);
  }

  async function _checkIfCredsAreValid(repoLocation, creds, service) {
    _log(`TODO: Logging in...`);
  }

  function _log(message) {
    console.log(`${repoLocation}: ${message}`);
  }

};
