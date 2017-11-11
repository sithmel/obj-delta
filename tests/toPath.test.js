var assert = require('chai').assert;
var toPath = require('../src/toPath');

describe('toPath', function () {
  it('from string', function () {
    var path = toPath('hello.world[2].try[2][3]');
    assert.deepEqual(path.data, ['hello','world', '2', 'try','2', '3']);
  });
  it('from array', function () {
    var path = toPath(['hello','world', '2', 'try','2', '3']);
    assert.deepEqual(path.data, ['hello','world', '2', 'try','2', '3']);
  });
  it('from undefined', function () {
    var path = toPath();
    assert.deepEqual(path.data, []);
  });
});
