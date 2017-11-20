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
    assert.deepEqual(delta._diff, diff);
    var json = JSON.stringify(delta._diff);
    assert.deepEqual(JSON.parse(json), diff);
  });

  describe('queue commands', function () {
    it('set', function () {
      var delta = Delta().set('hello', 'world');
      assert.equal(delta._diff.length, 1);
      assert.deepEqual(delta._diff[0].p, 'hello');
      assert.equal(delta._diff[0].c, 'set');
      assert.deepEqual(delta._diff[0].args, ['world']);
      assert.deepEqual(delta.toJSON(), '[{"c":"set","p":"hello","args":["world"]}]');
    });
    it('del', function () {
      var delta = Delta().del('hello');
      assert.equal(delta._diff.length, 1);
      assert.deepEqual(delta._diff[0].p, 'hello');
      assert.equal(delta._diff[0].c, 'del');
      assert.deepEqual(delta.toJSON(), '[{"c":"del","p":"hello","args":[]}]');
    });
    it('transform', function () {
      var callback = function (item) { return item; };
      var delta = Delta().transform('hello', callback);
      assert.equal(delta._diff.length, 1);
      assert.deepEqual(delta._diff[0].p, 'hello');
      assert.equal(delta._diff[0].c, 'transform');
      assert.deepEqual(delta._diff[0].args, [callback]);
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
      assert.equal(newObj.subtree, obj.subtree);
    });

    it('del', function () {
      var delta = Delta().del('hello.world');
      var obj = { hello: { world: 1, other: 2 }, hello2: {} };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: { other: 2 }, hello2: {} });
      assert.equal(newObj.hello2, obj.hello2);
    });

    it('del on an array', function () {
      var delta = Delta().del('hello[1]');
      var obj = { hello: [1, 2, 3], hello2: {} };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: [1, 3], hello2: {} });
      assert.equal(newObj.hello2, obj.hello2);
    });

    it('transform', function () {
      var delta = Delta().transform('hello.world', function (item) { return item * 2; });
      var obj = { hello: { world: 1, other: 2 }, hello2: {} };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: { world: 2, other: 2 }, hello2: {} });
      assert.equal(newObj.hello2, obj.hello2);
    });

    it('map', function () {
      var delta = Delta().map('hello.world', function (item) { return item * 2; });
      var obj = { hello: { world: [3, 2], other: 2 }, hello2: {} };
      var newObj = delta.apply(obj);
      assert.deepEqual(newObj, { hello: { world: [6, 4], other: 2 }, hello2: {} });
      assert.equal(newObj.hello2, obj.hello2);
    });
  });

  describe('diff', function () {
    var delta;
    beforeEach(function () {
      delta = new Delta();
    });
    it('no diff', function () {
      delta.diff({ hello: 2 }, { hello: 2 });
      assert.deepEqual(delta._diff, []);
    });
    it('one diff', function () {
      delta.diff({ hello: 1 }, { hello: 2 });
      assert.deepEqual(delta._diff, [
        { c: 'set', p: ['hello'], args: [2] }
      ]);
    });
    it('two diffs', function () {
      delta.diff({ hello: 1, world: 2 }, { hello: 2, world: 3 });
      assert.deepEqual(delta._diff, [
        { c: 'set', p: ['hello'], args: [2] },
        { c: 'set', p: ['world'], args: [3] }
      ]);
    });
    it('deep diff', function () {
      delta.diff({ hello: { world: 1} }, { hello: { world: 2} });
      assert.deepEqual(delta._diff, [
        { c: 'set', p: ['hello', 'world'], args: [2] },
      ]);
    });
    it('extra key to remove', function () {
      delta.diff({ hello: 1, world: 2 }, { hello: 1 });
      assert.deepEqual(delta._diff, [
        { c: 'del', p: ['world'], args: [] },
      ]);
    });
    it('extra key to add', function () {
      delta.diff({ hello: 1 }, { hello: 1, world: 2 });
      assert.deepEqual(delta._diff, [
        { c: 'set', p: ['world'], args: [2] },
      ]);
    });
    it('different types 1', function () {
      delta.diff({ hello: [1, 2] }, { hello: { a: 1 } });
      assert.deepEqual(delta._diff, [
        { c: 'set', p: ['hello'], args: [{ a: 1 }] },
      ]);
    });
    it('different types 2', function () {
      delta.diff({ hello: { a: 1 } }, { hello: [1, 2] });
      assert.deepEqual(delta._diff, [
        { c: 'set', p: ['hello'], args: [[1, 2]] },
      ]);
    });

  });
});
