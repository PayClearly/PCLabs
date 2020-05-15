const lib = require('./lib');
const btoa = require('btoa');

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

      answers.commitId = (projectData.tickets[btoa(answers.ticket || 'none')] || projectData.releases[btoa(`${answers.app}_v${answers.existingVersion}`)] || {}).commitId;
      answers.commitHash = (repoData.commits[answers.commitId] || {}).hash;

      if (config.delegates && config.delegates.onAnswers) await config.delegates.onAnswers(answers);
      return answers;
    },
  };

};
