const lib = require('./lib');

module.exports = (config) => {
  
  return {
    syncRepo: async (options) => {
      const repo = lib.git(config.repo);
      return repo.sync(options);
    },
    parseRepo: async (options) => {
      const repo = lib.git(config.repo);
      await repo.sync(options);
      return repo.parse(options);
    },
    parseProject: async (options, repoData) => {
      const project = lib.project(config.project);
      return project.parse(options, repoData);
    },
    prompt: async (options, answers = {}) => {

      const repo = lib.git(config.repo);
      const project = lib.project(config.project);

      await repo.sync(options);
      const repoData = await repo.parse(options);
      const projectData = await project.parse(options, repoData);
      const ask = await lib.questions({ repoData, projectData}, answers);
      
      await ask();

      console.log('here answers', answers);
    },
  };

};
