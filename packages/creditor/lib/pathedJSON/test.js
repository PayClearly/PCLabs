/* eslint global-require: 0 */
/* eslint no-unused-expressions: 0 */

const expect = require('chai').expect;
const pathedJSON = require('./');

describe('test - pathedJSON', () => {

  let get;
  let set;
  let copy;
  let toJSON;
  let toPaths;

  beforeEach(() => {

    const pathed = pathedJSON({
      state: {
        aa: 'jjjj',
        bb: true,
        cc: {
          dd: false,
          ee: 'other',
        },
      },
    });

    get = pathed.get;
    set = pathed.set;
    copy = pathed.copy;
    toJSON = pathed.toJSON;
    toPaths = pathed.toPaths;
  });

  describe('get', () => {
    it('should properly get data', () => {
      expect(get('/state/aa')).to.deep.equal('jjjj');
      expect(get('/state/cc')).to.deep.equal({ dd: false, ee: 'other' });
      expect(get('/cc')).to.deep.equal(undefined);
      expect(get('/state/cc/dd')).to.deep.equal(false);
    });
  });

  describe('set', () => {
    it('should properly retrieve data', () => {
      set('/otherState/aa', 'test');
      expect(get('/otherState/aa')).to.deep.equal('test');
    });

    it('should overwrite existing value', () => {
      set('/state/aa', 'new');
      expect(get('/state/aa')).to.deep.equal('new');
    });

    it('should not not overwrite if gently is set to true', () => {
      set('/state/aa', 'new', true);
      expect(get('/state/aa')).to.deep.equal('jjjj');
    });

    it('should return undefined for non existent paths', () => {
      expect(get('/state/aa/cc/dd/ee')).to.deep.equal(undefined);
    });

    it('should delete the the item if it is set to undefined or empty object', () => {
      set('/state/cc/dd', undefined);
      expect(get('/state/cc/dd')).to.deep.equal(undefined);
      expect(get('/state/cc')).to.deep.equal({ ee: 'other' });
    });

    it('should deeply cleanup object', () => {
      set('/state/cc/gg/ee/mm/kk', true);
      expect(get('/state/cc/gg/ee/mm/kk')).to.deep.equal(true);
      set('/state/cc/gg/ee/mm/kk', undefined);
      expect(get('state/cc/gg')).to.deep.equal(undefined);
      expect(get('/state/cc')).to.deep.equal({ ee: 'other', dd: false });
    });

  });

  describe('copy', () => {
    it('should properly copy a pathed JSON', () => {
      const copiedDB = copy();
      set('/state/aa', 'test');
      expect(copiedDB.get('/state/aa')).to.deep.equal('jjjj');
      expect(get('/state/aa')).to.deep.equal('test');
    });
  });

  describe('toJSON', () => {
    it('should properly toJSON a pathed JSON', () => {
      expect(toJSON().state.aa).to.deep.equal('jjjj');
    });
  });

  describe('toPaths', () => {
    it('should properly toPaths a pathed JSON', () => {
      expect(toPaths()).to.deep.equal({
        '/state/aa': 'jjjj',
        '/state/bb': true,
        '/state/cc/dd': false,
        '/state/cc/ee': 'other',
      });
    });

    it('should properly handle conflects', () => {
      const pathed = pathedJSON();
      pathed.set('state/a/b/c/d', 'abcd');
      pathed.set('state/a/b', 'ab');
      pathed.set('state/a/b/c', 'abc');
      pathed.set('state/a/bb', 'cc');
      expect(pathed.toPaths())
        .to.deep.equal({
          '/state/a/b': 'ab',
          '/state/a/bb': 'cc',
        });
    });

  });

});
