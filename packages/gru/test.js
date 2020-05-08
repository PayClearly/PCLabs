const expect = require('../../node_modules/chai').expect;
const gru = require('./');

let instance;
let spies = {};
let stubs = {};

const options = {
  apps: {
    test: {
      name: 'test',
      buildTagPrefix: 'build_test',
      envTagPrefix: 'env_test',
      build: async (key) => { spies.build = key; return stubs.build; },
      cache: async (key, zip) => { spies.cache = zip; return stubs.cache; },
      deploy: async (key, env) => { spies.deploy = env; return stubs.deploy; },
    }
  },
  customParser: () => {}
};

const delegates = {
  gitFetchTags: async () => { return stubs.gitFetchTags; },
  gitSetTag: async (tag) => { spies.gitSetTag = tag; return stubs.gitSetTag; },
  archive: async (location) => { spies.archive = location; return stubs.archive; },
};

describe('@pclabs/gru', () => {

  beforeEach(() => {
    stubs = {
      build: '/bildDir',
      cache: 'https://somlocation',
      deploy: '',
      gitFetchTags: [],
      gitSetTags: 'someTag',
      archive: '/acrchive.zip',
    };
    spies = {};
    instance = gru(options, delegates);
  });

  it('should build, cache, and deploy properly', async () => {
    await instance.run({ app: 'test', cache: 'true', deployTo: 'staging' });

    expect(spies.archive).to.equal(stubs.build);
    expect(spies.cache).to.equal(stubs.archive);
    expect(spies.deploy).to.equal(`staging`);
    expect(spies.gitSetTag).to.equal(`${options.apps.test.envTagPrefix}_staging`);

  });

  it('should build, cache, and deploy properly', async () => {
    await instance.run({ app: 'test', cache: 'true' });

    expect(spies.archive).to.equal(stubs.build);
    expect(spies.cache).to.equal(stubs.archive);
    expect(spies.gitSetTag).to.equal(`${options.apps.test.buildTagPrefix}_${spies.build}`);

  });

});
