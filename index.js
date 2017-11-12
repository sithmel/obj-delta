var _set = require('lodash/set');
var _get = require('lodash/get');
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
    this['_' + this.diff[i].c](obj, this.diff[i].p, this.diff[i].args);
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

Delta.prototype._set = function set(obj, path, args) {
  var value = args[0];
  _set(obj, path.toArray(), value);
};

Delta.prototype.del = function del(path) {
  return this._addCommand('del', path, arguments);
};

Delta.prototype._del = function del(obj, path, args) {
  var parentObj = _get(obj, path.slice(0, -1).toArray());
  if (parentObj) {
    delete parentObj[path.get(path.length - 1)];
  }
};

Delta.prototype.transform = function transform(path) {
  return this._addCommand('transform', path, arguments);
};

Delta.prototype._transform = function transform(obj, path, args) {
  var func = args[0];
  var objToTransform = _get(obj, path.toArray());
  _set(obj, path, func(objToTransform));
};

module.exports = Delta;
