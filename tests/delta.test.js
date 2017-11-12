var assert = require('chai').assert;
var Delta = require('..');

describe('Delta', function () {
  it('can be instantiated', function () {
    assert.typeOf(Delta, 'function');
    assert.instanceOf(new Delta(), Delta);
    assert.instanceOf(Delta(), Delta);
  });

  it('can be initialised/converted to JSON', function () {
    var diff = [{ p: 'test' }];
    var delta = new Delta(diff);
    assert.deepEqual(delta.diff, diff);
    var json = JSON.stringify(delta.diff);
    assert.deepEqual(JSON.parse(json), diff);
  });

  describe('queue commands', function () {
    it('set', function () {
      var delta = Delta().set('hello', 'world');
      assert.equal(delta.diff.length, 1);
      assert.deepEqual(delta.diff[0].p, 'hello');
      assert.equal(delta.diff[0].c, 'set');
      assert.deepEqual(delta.diff[0].arg, 'world');
    });
    it('del', function () {
      var delta = Delta().del('hello');
      assert.equal(delta.diff.length, 1);
      assert.deepEqual(delta.diff[0].p, 'hello');
      assert.equal(delta.diff[0].c, 'del');
    });
    it('transform', function () {
      var callback = function (item) { return item; };
      var delta = Delta().transform('hello', callback);
      assert.equal(delta.diff.length, 1);
      assert.deepEqual(delta.diff[0].p, 'hello');
      assert.equal(delta.diff[0].c, 'transform');
      assert.deepEqual(delta.diff[0].arg, callback);
    });
  });
});
