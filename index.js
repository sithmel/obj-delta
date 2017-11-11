var toPath = require('./src/toPath');
var smartClone = require('./src/smartClone');

function Delta(diff) {
  if (!(this instanceof Delta)) {
    return new Delta(diff);
  }
  this.diff = diff || [];
}


Delta.prototype.apply = function apply(obj) {
  var newObj = smartClone(obj, this.diff.map(function (d) { return d.p; }));
  for (var i = 0; i < this.diff.length; i++) {
    this['_' + this.diff[i].c](obj, this.diff[i]);
  }
  return newObj;
};

Delta.prototype.toJSON = function toJSON() {
  return diff;
};

Delta.prototype._addCommand = function _addCommand(command, path, arguments) {
  var args = Array.prototype.slice.call(arguments, 1);
  this.diff.push({ c: command, p: toPath(path), args: args });
  return this;
};

// commands
Delta.prototype.set = function set(path) {
  return this._addCommand('set', path, arguments);
};

Delta.prototype._set = function set(path) {
};

Delta.prototype.del = function del(path) {
  return this._addCommand('del', path, arguments);
};

Delta.prototype.transform = function transform(path) {
  return this._addCommand('transform', path, arguments);
};

// Delta.prototype.push = function push(path, item) {
//   this.diff.push({ c: 'push', p: toPath(path), v: value });
// };
//
// Delta.prototype.map = function map(path, func) {
//   this.diff.push({ c: 'map', p: toPath(path), func: func });
// };
//
// Delta.prototype.filter = function filter(path, func) {
//   this.diff.push({ c: 'filter', p: toPath(path), func: func });
// };
//
// Delta.prototype.slice = function filter(path, begin, end) {
//   this.diff.push({ c: 'filter', p: toPath(path), func: func });
// };

module.exports = Delta;
