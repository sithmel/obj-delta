var assert = require('chai').assert;
var c = require('../src/commands');

describe('commands', function () {
  it('set', function () {
    var obj = { hello: { world: 2 } };
    c.set(obj, 'hello.world', [3]);
    assert.deepEqual(obj, { hello: { world: 3 } });
  });

  it('del', function () {
    var obj = { hello: { world: 2 } };
    c.del(obj, 'hello.world');
    assert.deepEqual(obj, { hello: {} });
  });

  it('del (array)', function () {
    var obj = { hello: [0, 1, 2] };
    c.del(obj, 'hello[1]');
    assert.deepEqual(obj, { hello: [0, 2] });
  });

  it('transform', function () {
    var obj = { hello: { world: 2 } };
    c.transform(obj, 'hello.world', [function (n) { return n * 2; }]);
    assert.deepEqual(obj, { hello: { world: 4 } });
  });

  it('map on array', function () {
    var obj = { hello: { world: [2, 3] } };
    c.map(obj, 'hello.world', [function (n) { return n * 2; }]);
    assert.deepEqual(obj, { hello: { world: [4, 6] } });
  });

  it('map on object', function () {
    var obj = { hello: { world: { a: 2, b: 3 } } };
    c.map(obj, 'hello.world', [function (n) { return n * 2; }]);
    assert.deepEqual(obj, { hello: { world: { a: 4, b: 6 } } });
  });

  it('map on others (same as transform)', function () {
    var obj = { hello: { world: 5 } };
    c.map(obj, 'hello.world', [function (n) { return n * 2; }]);
    assert.deepEqual(obj, { hello: { world: 10 } });
  });

  it('filter on array', function () {
    var obj = { hello: { world: [ 1, 2, 3 ] } };
    c.filter(obj, 'hello.world', [function (n) { return n !== 2; }]);
    assert.deepEqual(obj, { hello: { world: [1, 3] } });
  });

  it('filter on object', function () {
    var obj = { hello: { world: { a: 1, b: 2, c: 3 } } };
    c.filter(obj, 'hello.world', [function (n) { return n !== 2; }]);
    assert.deepEqual(obj, { hello: { world: { a: 1, c: 3 } } });
  });

  it('filter on others', function () {
    var obj = { hello: { world: 3 } };
    c.filter(obj, 'hello.world', [function (n) { return n !== 2; }]);
    assert.deepEqual(obj, { hello: { world: 3 } });
  });

  it('filter on others (2)', function () {
    var obj = { hello: { world: 2 } };
    c.filter(obj, 'hello.world', [function (n) { return n !== 2; }]);
    assert.deepEqual(obj, { hello: { world: undefined } });
  });

  it('append', function () {
    var obj = { hello: { world: [1, 2] } };
    c.append(obj, 'hello.world', [['a', 'b']]);
    assert.deepEqual(obj, { hello: { world: [1, 2, 'a', 'b']} });
  });

  it('prepend', function () {
    var obj = { hello: { world: [1, 2] } };
    c.prepend(obj, 'hello.world', [['a', 'b']]);
    assert.deepEqual(obj, { hello: { world: ['a', 'b', 1, 2]} });
  });

  it('insert', function () {
    var obj = { hello: { world: [1, 2] } };
    c.insert(obj, 'hello.world', [['a', 'b'], 1]);
    assert.deepEqual(obj, { hello: { world: [1, 'a', 'b', 2]} });
  });

  it('append (not array)', function () {
    var obj = { hello: { world: 1 } };
    c.append(obj, 'hello.world', [['a', 'b']]);
    assert.deepEqual(obj, { hello: { world: [1, 'a', 'b']} });
  });

  it('prepend (not array)', function () {
    var obj = { hello: { world: 1 } };
    c.prepend(obj, 'hello.world', [['a', 'b']]);
    assert.deepEqual(obj, { hello: { world: ['a', 'b', 1]} });
  });

  it('insert (not array)', function () {
    var obj = { hello: { world: 1 } };
    c.insert(obj, 'hello.world', [['a', 'b'], 1]);
    assert.deepEqual(obj, { hello: { world: ['a', 'b', 1]} });
  });

  it('merge (object)', function () {
    var obj = { hello: { world: {a: 1, b: 2} } };
    c.merge(obj, 'hello.world', [{ a: 3, c: 4 }]);
    assert.deepEqual(obj, { hello: { world: {a: 3, b: 2, c: 4 } } });
  });

  it('merge (array)', function () {
    var obj = { hello: { world: [1, 2, 3] } };
    c.merge(obj, 'hello.world', [{ a: 3, c: 4 }]);
    assert.deepEqual(obj, { hello: { world: [1, 2, 3] } });
  });

  it('slice (array)', function () {
    var obj = { hello: { world: [1, 2, 3] } };
    c.slice(obj, 'hello.world', [1]);
    assert.deepEqual(obj, { hello: { world: [2, 3] } });
  });

  it('removeKeys (array)', function () {
    var obj = { hello: { world: [1, 2, 3, 4] } };
    c.removeKeys(obj, 'hello.world', [[1, 2]]);
    assert.deepEqual(obj, { hello: { world: [1, 4] } });
  });

  it('removeKeys (object)', function () {
    var obj = { hello: { world: { a: 1, b: 2, c: 3 } } };
    c.removeKeys(obj, 'hello.world', [['b', 'c']]);
    assert.deepEqual(obj, { hello: { world: { a: 1 } } });
  });

  it('removeValues (array)', function () {
    var obj = { hello: { world: ['a', 'b', 'c', 'd'] } };
    c.removeValues(obj, 'hello.world', [['c', 'd']]);
    assert.deepEqual(obj, { hello: { world: ['a', 'b'] } });
  });

  it('removeValues (object)', function () {
    var obj = { hello: { world: { a: 1, b: 2, c: 3 } } };
    c.removeValues(obj, 'hello.world', [[2, 3]]);
    assert.deepEqual(obj, { hello: { world: { a: 1 }  } });
  });
});
