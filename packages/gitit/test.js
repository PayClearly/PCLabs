const expect = require('../../node_modules/chai').expect;
const gitit = require('./');

const instance = gitit({});

describe('@pclabs/gitit', () => {
  it('should run', () => {
    expect(typeof instance.prompt === 'function').to.equal(true);
  });
});
