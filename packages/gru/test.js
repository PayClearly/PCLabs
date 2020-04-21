const expect = require('../../node_modules/chai').expect;
const gru = require('./');

const instance = gru({});

describe('@pclabs/gru', () => {
  it('should run', () => {
    expect(typeof instance.run).to.equal('function');
  });
});
