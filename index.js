var _set = require('lodash/set');
var _get = require('lodash/get');
var _toPath = require('lodash/toPath');
var smartClone = require('./src/smartClone');

function Delta(diff) {
  if (!(this instanceof Delta)) {
    return new Delta(diff);
  }
  this.diff = diff || [];
  this.changeTree = {};
}

Delta.prototype.apply = function apply(obj) {
  var newObj = smartClone(obj, this.changeTree);
  for (var i = 0; i < this.diff.length; i++) {
    this['_' + this.diff[i].c](obj, this.diff[i].p, this.diff[i].arg);
  }
  return newObj;
};

Delta.prototype.toJSON = function toJSON() {
  // check allowed diffs (no transform)
  return diff;
};

Delta.prototype._addCommand = function _addCommand(command, path, arg) {
  this.diff.push({ c: command, p: path, arg: arg });
  _set(this.changeTree, path, true);
  return this;
};

// commands
Delta.prototype.set = function set(path, value) {
  return this._addCommand('set', path, value);
};

Delta.prototype._set = function set(obj, path, value) {
  _set(obj, path, value);
};

Delta.prototype.del = function del(path) {
  return this._addCommand('del', path);
};

Delta.prototype._del = function del(obj, path) {
  var pathArray = _toPath(path);
  var parentObj = _get(obj, pathArray.slice(0, -1));
  if (parentObj) {
    delete parentObj[pathArray[path.length - 1]];
  }
};

Delta.prototype.transform = function transform(path, func) {
  return this._addCommand('transform', path, func);
};

Delta.prototype._transform = function transform(obj, path, func) {
  var objToTransform = _get(obj, path);
  _set(obj, path, func(objToTransform));
};

module.exports = Delta;
