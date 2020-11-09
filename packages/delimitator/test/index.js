const exec = require('child_process').exec;
const path = require('path');
const expect = require('chai').expect;
const sandbox = require('sinon').createSandbox();

describe('Delimitator', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('CLI', () => {
    it('should error if no config is provided', () => {
      return cli(['nonexistentfile.csv']).then(({ code, error }) =>{
        expect(code).to.equal(1);
        return expect(error.message.includes('missing required argument')).to.equal(true);
      });
    });
    it('should go through if provided files are valid', () => {
      return cli(['./test/test_csv.csv', './test/test_config.js']).then((res) =>{
        expect(res.code).to.equal(0);
        return expect(res.error).to.not.exist;
      });
    });
  });
});

const cli = (args, cwd) => {
  return new Promise(resolve => {
    return exec(`node ${path.resolve('./index.js')} ${args.join(' ')}`, { cwd }, (error, stdout, stderr) => {
      return resolve({ code: error && error.code ? error.code : 0, error, stdout, stderr })
    });
  });
};
