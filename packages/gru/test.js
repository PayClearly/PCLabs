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
      envReqTagPrefix: 'env_test',
      releaseTagPrefix: 'release_test',
      releaseReqTagPrefix: 'releasereq_test',
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
  gitRemoveTag: async (tag) => { spies.gitRemoveTag = tag; return stubs.gitRemoveTag; },
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
      gitRemoveTag: 'someTag',
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
    expect(spies.gitRemoveTag).to.equal(`${options.apps.test.envReqTagPrefix}_staging`);
    expect(spies.gitSetTag).to.equal(`${options.apps.test.envTagPrefix}_staging`);

  });

  it('should build, cache, and release properly', async () => {
    await instance.run({ app: 'test', cache: 'true', release: 'v2.2.2' });

    expect(spies.archive).to.equal(stubs.build);
    expect(spies.cache).to.equal(stubs.archive);
    expect(spies.deploy).to.equal(`v2.2.2`);
    expect(spies.gitRemoveTag).to.equal(`${options.apps.test.releaseReqTagPrefix}_v2.2.2`);
    expect(spies.gitSetTag).to.equal(`${options.apps.test.releaseTagPrefix}_v2.2.2`);
  });

  it('should build, cache, and deploy properly', async () => {
    await instance.run({ app: 'test', cache: 'true' });

    expect(spies.archive).to.equal(stubs.build);
    expect(spies.cache).to.equal(stubs.archive);
    expect(spies.gitSetTag).to.equal(`${options.apps.test.buildTagPrefix}_${spies.build}`);

  });

});
