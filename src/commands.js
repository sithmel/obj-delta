var _set = require('lodash/set');
var _get = require('lodash/get');
var _map = require('lodash/map');
var _mapValues = require('lodash/mapValues');
var _filter = require('lodash/filter');
var _isPlainObject = require('lodash/isPlainObject');
var _toPath = require('lodash/toPath');
var _assign = require('lodash/assign');
var _includes = require('lodash/includes');
var _pickBy = require('lodash/pickBy');


function set(obj, path, value) {
  _set(obj, path, value);
}

function del(obj, path) {
  var pathArray = _toPath(path);
  var parentObj = _get(obj, pathArray.slice(0, -1));
  if (Array.isArray(parentObj)) {
    parentObj.splice(pathArray[pathArray.length - 1], 1);
  } else if (_isPlainObject(parentObj)){
    delete parentObj[pathArray[pathArray.length - 1]];
  }
}

function transform(obj, path, func) {
  var objToTransform = _get(obj, path);
  _set(obj, path, func(objToTransform));
}

function map(obj, path, func) {
  transform(obj, path, function (item) {
    if (Array.isArray(item)) {
      return _map(item, func);
    } else if (_isPlainObject(item)) {
      return _mapValues(item, func);
    } else {
      return func(item);
    }
  });
}

function filter(obj, path, func) {
  transform(obj, path, function (item) {
    if (Array.isArray(item)) {
      return _filter(item, func);
    } else if (_isPlainObject(item)) {
      return _pickBy(item, func);
    } else {
      return func(item) ? item : undefined;
    }
  });
}

function append(obj, path, arr) {
  transform(obj, path, function (item) {
    if (Array.isArray(item)) {
      return item.concat(arr);
    } else {
      return [item].concat(arr);
    }
  });
}

function prepend(obj, path, arr) {
  transform(obj, path, function (item) {
    if (Array.isArray(item)) {
      return arr.concat(item);
    } else {
      return arr.concat([item]);
    }
  });
}

function insert(obj, path, args) {
  var arr = args[0];
  var index = args[1] || 0;

  transform(obj, path, function (item) {
    var head, tail;
    if (Array.isArray(item)) {
      head = item.slice(0, index);
      tail = item.slice(index);
      return [].concat(head, arr, tail);
    } else {
      return arr.concat([item]);
    }
  });
}

function merge(obj, path, objToMerge) {
  transform(obj, path, function (item) {
    return _assign({}, item, objToMerge);
  });
}

function slice(obj, path, args) {
  var begin = args[0];
  var end = args[1];
  transform(obj, path, function (item) {
    if (Array.isArray(item)) {
      return item.slice(begin, end);
    } else {
      return item;
    }
  });
}

function removeKeys(obj, path, keys) {
  filter(obj, path, function (value, key) {
    return _includes(keys, key);
  });
}

function removeValues(obj, path, values) {
  filter(obj, path, function (value, key) {
    return _includes(values, value);
  });
}

module.exports = {
  set: set,
  del: del,
  transform: transform,
  map: map,
  filter: filter,
  append: append,
  prepend: prepend,
  insert: insert,
  merge: merge,
  slice: slice,
  removeKeys: removeKeys,
  removeValues: removeValues,
};
