var assert = require('chai').assert;
var smartClone = require('../src/smartClone');

describe('smart clone', function () {
  it('clones a simple object', function () {
    var obj = { hello: {}, world: {} };
    var newObj = smartClone(obj, { hello: true });

    assert.deepEqual(obj, newObj);
    assert.notEqual(obj, newObj);
    assert.notEqual(obj.hello, newObj.hello);
    assert.equal(obj.world, newObj.world);
  });

  it('clones a simple object 2', function () {
    var obj = { hello: {
      world: {},
      world1: {}
    },
    world: {} };
    var newObj = smartClone(obj, { hello: { world: true } });
    assert.deepEqual(obj, newObj);
    assert.notEqual(obj, newObj);
    assert.notEqual(obj.hello, newObj.hello);
    assert.equal(obj.world, newObj.world);
    assert.notEqual(obj.hello.world, newObj.hello.world);
    assert.equal(obj.hello.world1, newObj.hello.world1);
  });

  it('clones a value', function () {
    var obj = 1;
    var newObj = smartClone(obj, { hello: true });
    assert.deepEqual(obj, newObj);
  });
});
