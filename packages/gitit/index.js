const lib = require('./lib');

module.exports = (config) => {
  
  return {
    syncRepo: async () => {
      const repo = lib.git(config.repo);
      return repo.sync();
    },
    parseRepo: async () => {
      const repo = lib.git(config.repo);
      await repo.sync();
      return repo.parse();
    },
    parseProject: async (repoData) => {
      const project = lib.project(config.project);
      return project.parse(repoData);
    },
  };

};
