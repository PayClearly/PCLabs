const creditor = require('../');
const instance = creditor();

return instance.prompt().then((answers) => {
  return instance.perform(answers);
});
