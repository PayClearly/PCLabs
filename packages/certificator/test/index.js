const exec = require('child_process').exec;
const path = require('path');
const expect = require('chai').expect;
const rewire = require('rewire');
const sandbox = require('sinon').createSandbox();

const acme = rewire('../lib/acme.js');

describe('Certificator', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('CLI', () => {
    it('should Error if no config or plugin is provided', () => {
      return cli(['--dry-run', 'create', 'certificate']).then(({ code, error }) =>{
        expect(code).to.equal(1);
        return expect(error.message.includes('A plugin or config is required to set and remove DNS challenges')).to.equal(true);
      });
    });
  });
});

const cli = (args, cwd) => {
  return new Promise(resolve => {
    return exec(`node ${path.resolve('../index.js')} ${args.join(' ')}`, { cwd }, (error, stdout, stderr) => {
      return resolve({ code: error && error.code ? error.code : 0, error, stdout, stderr })
    })
  });
};

const _shouldNotResolve = () => {
  throw new Error('should not resolve');
};
