const expect = require('../../node_modules/chai').expect;
const minion = require('./');

const instance = minion({});

describe('@pclabs/minion', () => {
  it('should run', () => {
    expect(instance.name()).to.equal('minion');
  });
});
