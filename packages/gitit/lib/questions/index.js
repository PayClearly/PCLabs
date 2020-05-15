const inquiryWrapper = require('./inquiryWrapper');
const semver = require('semver');
const chalk = require('chalk');
const atob = require('atob');

module.exports = (data, answers) => {

  data.commitsToEnvs = Object.keys(data.projectData.envs || {})
    .filter(item => item)
    .reduce((acc, encoded) => {
      const val = atob(encoded);
      const commit = data.projectData.envs[encoded].commitId;
      const app = val.split('_')[0];
      const env = val.split('_')[1];
      acc[app] = acc[app] || {};
      acc[app][commit] = acc[app][commit] || [];
      acc[app][commit].push(env);
      return acc;
    }, {});

  data.commitsToEnvReqs = Object.keys(data.projectData.envReqs || {})
    .filter(item => item)
    .reduce((acc, encoded) => {
      const val = atob(encoded);
      const commit = data.projectData.envReqs[encoded].commitId;
      const app = val.split('_')[0];
      const envReq = val.split('_')[1];
      acc[app] = acc[app] || {};
      acc[app][commit] = acc[app][commit] || [];
      acc[app][commit].push(envReq);
      return acc;
    }, {});

  data.commitsToReleases = Object.keys(data.projectData.releases || {})
    .filter(item => item)
    .reduce((acc, encoded) => {
      const val = atob(encoded);
      const commit = data.projectData.releases[encoded].commitId;
      const app = val.split('_')[0];
      const release = val.split('_')[1];
      acc[app] = acc[app] || {};
      acc[app][commit] = semver.coerce(release).raw;
      return acc;
    }, {});

  data.commitsToReleaseReqs = Object.keys(data.projectData.releaseReqs || {})
    .filter(item => item)
    .reduce((acc, encoded) => {
      const val = atob(encoded);
      const commit = data.projectData.releaseReqs[encoded].commitId;
      const app = val.split('_')[0];
      const releaseReqs = val.split('_')[1];
      acc[app] = acc[app] || {};
      acc[app][commit] = releaseReqs;
      return acc;
    }, {});

  data.commitsToTickets = Object.keys(data.projectData.tickets || {})
    .filter(item => item)
    .reduce((acc, encoded) => {
      const val = atob(encoded);
      acc[data.projectData.tickets[encoded].commitId] = val;
      return acc;
    }, {});

  return inquiryWrapper(questions(data, answers), answers, questionRenderer, stateRenderer, 15, Object.keys(answers || []));
};

const questions = (data, answers = {}) => {

  const apps = data.apps || ['wfs', 'app'];
  const envs = data.envs || ['staging', 'prod'];

  return {
    action: () => {
      return {
        type: 'list',
        name: 'action',
        choices: ['release', 'deploy'],
        message: 'What action would you like to do?',
      };
    },
    app: () => {
      return {
        type: 'list',
        name: 'app',
        choices: apps,
        message: `Which app are you intersted in ${answers.action}ing?`,
      };
    },
    env: () => {
      return {
        type: 'list',
        name: 'env',
        choices: envs,
        message: `Which environment do you want to deploy ${answers.app} to?`,
      };
    },
    existingVersion: () => {
      let currentRelease;
      const releaseObj = {};
      const envObj = {};
      const envReqObj = {};

      Object.keys(data.commitsToTickets || {})
        .reverse()
        .forEach((commitId) => {
          const ticket = data.commitsToTickets[commitId];

          const release = data.commitsToReleases && data.commitsToReleases[answers.app] && data.commitsToReleases[answers.app][commitId];
          const envs = data.commitsToEnvs && data.commitsToEnvs[answers.app] && data.commitsToEnvs[answers.app][commitId];
          const envReqs = data.commitsToEnvReqs && data.commitsToEnvReqs[answers.app] && data.commitsToEnvReqs[answers.app][commitId];

          currentRelease = release || currentRelease;
          if (!currentRelease) return;

          envObj[currentRelease] = envObj[currentRelease] || envs || '';
          envReqObj[currentRelease] = envReqObj[currentRelease] || envReqs || '';
          releaseObj[currentRelease] = releaseObj[currentRelease] || [];
          if (releaseObj[currentRelease].length > 4) return;
          if (releaseObj[currentRelease].length > 3) return releaseObj[currentRelease].push('...');
          releaseObj[currentRelease].push(ticket);
        });
      
      const releses = Object.keys(releaseObj || {})
        .map((releaseId) => {
          const envs = envObj[releaseId];
          const envReqs = envReqObj[releaseId];
          return `${releaseId}`
            + ' '
            + (envReqs && chalk.red(('deploying to ' + envReqs + ' ')) || '' )
            + (envs && chalk.bold((envs + ' ')) || '' )
            + chalk.grey('(' + releaseObj[releaseId].reduce((acc, ticket) => {
              return acc + ((acc.length && ', ') || '') + `${ticket}`;
            }, '') + ')');
        });

      return {
        type: 'list',
        name: 'existingVersion',
        choices: releses,
        message: `Which release do you want to deploy?`,
        transformer: (input) => {
          return input.split(' ')[0];
        }
      };
    },
    ticket: () => {
      const tickets = Object.keys(data.commitsToTickets || {})
        .map((commitId) => {
          const ticket = data.commitsToTickets[commitId];

          const release = data.commitsToReleases && data.commitsToReleases[answers.app] && data.commitsToReleases[answers.app][commitId];
          const releaseReq = data.commitsToReleaseReqs && data.commitsToReleaseReqs[answers.app] && data.commitsToReleaseReqs[answers.app][commitId];
          const envs = data.commitsToEnvs && data.commitsToEnvs[answers.app] && data.commitsToEnvs[answers.app][commitId];

          return `${ticket}${releaseReq && chalk.red(` creating release ${releaseReq}...`)  || ''}${release && ` ${chalk.green(release)}`|| ''}${envs && ` ${chalk.cyan(envs)}`|| ''}`;
        })
        .reverse().concat([' ---- Bottom ----', ' ', ' ',' ', ' ', ' ', ' ', ' ---- Merged ----']);

      return {
        type: 'list',
        name: 'ticket',
        choices: tickets,
        message: `At which ticket would you like to cut from?`,
        validate: (input) => {
          // TODO -- unfortuneatly validate is not valid for list type propmps
        },
      };
    },
    newVersion: () => {
      let lowV, highV;

      let higher = true;
      Object.keys(data.commitsToTickets)
        .reverse()
        .forEach((commitId) => {
          if (answers.ticket === data.commitsToTickets[commitId]) higher = false;
          highV = higher && data.commitsToReleases[answers.app] && data.commitsToReleases[answers.app][commitId] || highV;
          lowV = lowV || (!higher && data.commitsToReleases[answers.app] && data.commitsToReleases[answers.app][commitId]);
        });

      return {
        type: 'input',
        name: 'newVersion',
        message: `What would you like the version to be${(lowV || highV) && chalk.cyan(` (${lowV && ` >${lowV}` || ''}${lowV && highV && ' ,' || ''}${highV && ` <${highV}` || '' } )`) || ''}?`,
        validate: (input) => {
          if (answers.ticket.indexOf(' ') === 0) return 'go back and select a valid ticket';
          if (answers.ticket.split(' ')[1]) return `${answers.ticket.split(' ')[0]} already has a release(${answers.ticket.split(' ')[1]}) associated with it, go back to fix`;
          if (!semver.valid(input)) return 'Must use semantic versioning';
          if (lowV && semver.lt(input, lowV)) return `Must be greater than ${lowV}`;
          if (highV && semver.gt(input, highV)) return `Must be less than ${highV}`;
          return true;
        },
        transformer: (input) => {
          return input;
        }
      };
    },
    areYouSure: () => {
      return {
        type: 'list',
        name: 'areYouSure',
        choices: ['no', 'yes'],
        message: 'Are you sure?',
        transformer: (input) => {
          return input === 'yes' && true || false;
        },
      };
    },
  };
};

function questionRenderer(answers) {
  if (!answers.action) return 'action';
  
  if (answers.action === 'deploy') {
    if (!answers.app) return 'app';
    if (!answers.existingVersion) return 'existingVersion';
    if (!answers.env) return 'env';
    if (!answers.areYouSure) return 'areYouSure';
  }

  if (answers.action === 'release') {
    if (!answers.app) return 'app';
    if (!answers.ticket) return 'ticket';
    if (!answers.newVersion) return 'newVersion';
    if (!answers.areYouSure) return 'areYouSure';
  }

  if (answers.action === 'analyze') {
    // TODO
  }

  return false;
}

function stateRenderer(answers, questions = []) {
  const currentQuestion = questions[questions.length -1] || '';

  if (questions.length <= 1) return chalk.green(logo);
  const header = chalk.green(logo);

  let toReturn = header;
  switch (answers.action) {
  case 'deploy':
    toReturn += `  ${sr('action')} ${sr('app')} v${sr('existingVersion')} to ${sr('env')}`;
    break;
  case 'release':
    toReturn += `  Cut ${sr('action')} from ${sr('app')} at ${sr('ticket')} as ${sr('newVersion')}`;
    break;
  default:
    toReturn += chalk.green('?:');
    break;
  }

  if (currentQuestion === 'areYouSure') toReturn += chalk.green(' ?');

  const done = toReturn.indexOf('?') < 0;
  return toReturn + `${!done && '\n' || ''}
${!done && chalk.dim('Ctrl + b to go back') || ''}
`;

  function sr(name) {
    return answers[name] && chalk.cyan(answers[name]) || ((name === currentQuestion) && chalk.green('?')) || '?';
  }
}

const logo = `
  $$     $        $             
 $ $  $ $$$    $ $$$
  $$  $  $     $  $ 

`;
