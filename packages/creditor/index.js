const lib = require('./lib');
const questions = require('./lib/questions');
const chalk = require('chalk');

module.exports = () => {

  const config = lib.utils.buildConfig();
  
  return {
    prompt: async (answers = {}) => {
      await _initialize(config);
      config._answers = answers;
      const ask = await lib.inquiryWrapper(questions(config, config._answers), config._answers, questionRenderer, stateRenderer, 15, Object.keys(config._answers));

      await ask();

      return config._answers;
    },
    perform: async (answers) => {
      const analysis = await _initialize(config);
      const { action, pattern, location, name, mvSrc, mvDest, plural } = answers;
      let toWrite = [];

      if (action === 'create') {
        toWrite = await lib.utils.renderPattern(config, pattern, location, name);
      }

      if (action === 'move') {
        toWrite = await lib.utils.moveItems(config, plural, mvSrc, mvDest);
      }

      if (action === 'analyze') {
        console.log(analysis);
      }

      // TODO output manifest

      await Promise.all((toWrite || [])
        .map((toWrite) => {
          if (toWrite.action === 'create') {
            console.log(`${chalk.green((toWrite.action).toUpperCase())} ${toWrite.path.split(`${config.cwd}/`)[1]}`);
            return lib.fs.writeFile(toWrite.path, toWrite.contents);
          }
          if (toWrite.action === 'update') {
            console.log(`${chalk.yellow((toWrite.action).toUpperCase())} ${toWrite.path.split(`${config.cwd}/`)[1]}`);
            return lib.fs.writeFile(toWrite.path, toWrite.contents);
          }
          if (toWrite.action === 'delete') {
            console.log(`${chalk.red((toWrite.action).toUpperCase())} ${toWrite.path.split(`${config.cwd}/`)[1]}`);
            return lib.fs.removeRecursive(toWrite.path);
          }
        }));
       
      if (config['exporters']) {
        const toWriteExports = await lib.utils.renderExporters(config);
        await Promise.all(toWriteExports
          .map((toWrite) => {
            return lib.fs.writeFile(toWrite.path, toWrite.contents);
          }));
      }
      

    },
    analyze: async () => {
      // TODO
    },
  };

};

async function _initialize(config) {
  if (config._analysis) return config._analysis;
  config._analysis = lib.analyze(config);
  if (config['exporters']) {
    const toWriteExports = await lib.utils.renderExporters(config);
    await Promise.all(toWriteExports
      .map((toWrite) => {
        return lib.fs.writeFile(toWrite.path, toWrite.contents);
      }));
  }
}

function questionRenderer(answers) {
  if (!answers.action) return 'action';
  
  if (answers.action === 'create') {
    if (!answers.pattern) return 'pattern';
    if (!answers.location) return 'location';
    if (!answers.name) return 'name';
    if (!answers.areYouSure) return 'areYouSure';
  }

  if (answers.action === 'move') {
    if (!answers.plural) return 'plural';
    if (!answers.mvSrc) return 'mvSrc';
    if (!answers.mvDest) return 'mvDest';
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
  case 'create':
    toReturn += `  ${sr('action')} a ${sr('pattern')} at ${sr('location')} named ${sr('name')}`;
    break;
  case 'move':
    toReturn += `  ${sr('action')} all ${sr('plural')} at ${sr('mvSrc')} to ${sr('mvDest')}`;
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
  $$         $  $   $         
 $    $$ $$ $$     $$$  $$ $$ 
  $$  $  $$ $$  $   $   $$ $

`;
