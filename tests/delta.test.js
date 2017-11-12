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
      assert.deepEqual(delta.toJSON(), '[{"c":"set","p":"hello","arg":"world"}]')
    });
    it('del', function () {
      var delta = Delta().del('hello');
      assert.equal(delta.diff.length, 1);
      assert.deepEqual(delta.diff[0].p, 'hello');
      assert.equal(delta.diff[0].c, 'del');
      assert.deepEqual(delta.toJSON(), '[{"c":"del","p":"hello"}]')
    });
    it('transform', function () {
      var callback = function (item) { return item; };
      var delta = Delta().transform('hello', callback);
      assert.equal(delta.diff.length, 1);
      assert.deepEqual(delta.diff[0].p, 'hello');
      assert.equal(delta.diff[0].c, 'transform');
      assert.deepEqual(delta.diff[0].arg, callback);
      assert.throws(function () {
        delta.toJSON();
      }, Error);
    });
  });

  describe('commands', function () {
    it('set', function () {
      var delta = Delta().set('hello', 'world');
      var obj = { subtree: { test: 1 } };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: 'world', subtree: { test: 1 } });
      assert.equal(newObj.subtree, obj.subtree)
    });

    it('del', function () {
      var delta = Delta().del('hello.world');
      var obj = { hello: { world: 1, other: 2 }, hello2: {} };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: { other: 2 }, hello2: {} });
      assert.equal(newObj.hello2, obj.hello2)
    });

    it('del on an array', function () {
      var delta = Delta().del('hello[1]');
      var obj = { hello: [1, 2, 3], hello2: {} };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: [1, 3], hello2: {} });
      assert.equal(newObj.hello2, obj.hello2)
    });

    it('transform', function () {
      var delta = Delta().transform('hello.world', function (item) { return item * 2; });
      var obj = { hello: { world: 1, other: 2 }, hello2: {} };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: { world: 2, other: 2 }, hello2: {} });
      assert.equal(newObj.hello2, obj.hello2)
    });
  });
});
