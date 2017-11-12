var _set = require('lodash/set');
var _get = require('lodash/get');
var _map = require('lodash/map');
var _mapValues = require('lodash/mapValues');
var _filter = require('lodash/filter');
var _isPlainObject = require('lodash/isPlainObject');
var _toPath = require('lodash/toPath');
var _assign = require('lodash/assign');
var _includes = require('lodash/includes');
var smartClone = require('./src/smartClone');

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
    this['_' + this.diff[i].c](newObj, this.diff[i].p, this.diff[i].arg);
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

// *********************
// command implementation
// *********************

Delta.prototype._set = function set(obj, path, value) {
  _set(obj, path, value);
};

Delta.prototype._del = function del(obj, path) {
  var pathArray = _toPath(path);
  var parentObj = _get(obj, pathArray.slice(0, -1));
  if (Array.isArray(parentObj)) {
    parentObj.splice(pathArray[pathArray.length - 1], 1);
  } else if (_isPlainObject(parentObj)){
    delete parentObj[pathArray[pathArray.length - 1]];
  }
};

Delta.prototype._transform = function transform(obj, path, func) {
  var objToTransform = _get(obj, path);
  _set(obj, path, func(objToTransform));
};

Delta.prototype._map = function _map(obj, path, func) {
  this._transform(obj, function (item) {
    if (Array.isArray(item)) {
      return _map(item, func);
    } else if (_isPlainObject(item)) {
      return _mapValues(item, func);
    } else {
      return func(item);
    }
  });
};

Delta.prototype._filter = function _filter(path, func) {
  this._transform(obj, function (item) {
    if (Array.isArray(item)) {
      return _filter(item, func);
    } else if (_isPlainObject(item)) {
      return _pickBy(item, func);
    } else {
      return func(item) ? item : undefined;
    }
  });
};

Delta.prototype._append = function _append(path, arr) {
  this._transform(obj, function (item) {
    if (Array.isArray(item)) {
      return item.concat(arr);
    } else {
      return [item].concat(arr);
    }
  });
};

Delta.prototype._prepend = function _prepend(path, arr) {
  this._transform(obj, function (item) {
    if (Array.isArray(item)) {
      return arr.concat(item);
    } else {
      return arr.concat([item]);
    }
  });
};

Delta.prototype._insert = function _insert(path, args) {
  var arr = args[0];
  var index = args[1] || 0;

  this._transform(obj, function (item) {
    var head, tail;
    if (Array.isArray(item)) {
      head = item.slice(0, index);
      tail = item.slice(index);
      return [].concat(begin, arr, end);
    } else {
      return arr.concat([item]);
    }
  });
};

Delta.prototype._merge = function _merge(path, obj) {
  this._transform(obj, function (item) {
    return _assign({}, item, obj);
  });
};

Delta.prototype._slice = function _slice(path, begin, end) {
  var begin = args[0];
  var end = args[1];
  this._transform(obj, function (item) {
    if (Array.isArray(item)) {
      return item.slice(begin, end);
    } else {
      return item;
    }
  });
};

Delta.prototype._removeKeys = function _removeKeys(path, keys) {
  this._filter(obj, function (value, key) {
    return _includes(keys, key);
  });
};

Delta.prototype._removeValues = function _removeValues(path, values) {
  this._filter(obj, function (value, key) {
    return _includes(values, value);
  });
};

module.exports = Delta;
