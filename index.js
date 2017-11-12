var _set = require('lodash/set');
var smartClone = require('./src/smartClone');
var commands = require('./src/commands');

function Delta(diff) {
  if (!(this instanceof Delta)) {
    return new Delta(diff);
  }
  this.diff = diff || [];
  this.changeTree = {};
  for (var i = 0; i < this.diff; i++) {
    _set(this.changeTree, this.diff[i].p, true);
  }
}

Delta.prototype.apply = function apply(obj) {
  var newObj = smartClone(obj, this.changeTree);
  for (var i = 0; i < this.diff.length; i++) {
    commands[this.diff[i].c](newObj, this.diff[i].p, this.diff[i].arg);
  }
  return newObj;
};

Delta.prototype.toJSON = function toJSON() {
  // check allowed diffs (no transform)
  return JSON.stringify(this.diff, function (key, value) {
    if(typeof value === 'function') {
      throw new Error('You cannot serialize a delta object containing functions (like transform, filter, map, etc.)');
    }
    return value;
  });
};

Delta.prototype._addCommand = function _addCommand(command, path, arg) {
  this.diff.push({ c: command, p: path, arg: arg });
  _set(this.changeTree, path, true);
  return this;
};

// *********************
// queue commands
// *********************

Delta.prototype.set = function set(path, value) {
  return this._addCommand('set', path, value);
};

Delta.prototype.del = function del(path) {
  return this._addCommand('del', path);
};

Delta.prototype.transform = function transform(path, func) {
  return this._addCommand('transform', path, func);
};

Delta.prototype.map = function map(path, func) {
  return this._addCommand('map', path, func);
};

Delta.prototype.filter = function filter(path, func) {
  return this._addCommand('filter', path, func);
};

Delta.prototype.append = function append(path, arr) {
  return this._addCommand('append', path, arr);
};

Delta.prototype.prepend = function prepend(path, arr) {
  return this._addCommand('prepend', path, arr);
};

Delta.prototype.insert = function insert(path, arr, index) {
  return this._addCommand('insert', path, [ arr, index ]);
};

Delta.prototype.merge = function merge(path, obj) {
  return this._addCommand('merge', path, obj);
};

Delta.prototype.slice = function slice(path, begin, end) {
  return this._addCommand('slice', path, [begin, end]);
};

Delta.prototype.removeKeys = Delta.prototype.removeIndexes = function removeKeys(path, keys) {
  return this._addCommand('removeKeys', path, keys);
};

Delta.prototype.removeValues = function removeValues(path, values) {
  return this._addCommand('removeValues', path, values);
};

module.exports = Delta;
