const expect = require('../../node_modules/chai').expect;
const <%= short_name %> = require('./');

const instance = <%= short_name %>({});

describe('@pclabs/<%= short_name %>', () => {
  it('should run', () => {
    expect(instance.name()).to.equal('<%= short_name %>');
  });
});
