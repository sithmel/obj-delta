var _set = require('lodash/set')
var _get = require('lodash/get')
var _map = require('lodash/map')
var _mapValues = require('lodash/mapValues')
var _filter = require('lodash/filter')
var _isPlainObject = require('lodash/isPlainObject')
var _toPath = require('lodash/toPath')
var _assign = require('lodash/assign')
var _includes = require('lodash/includes')
var _pickBy = require('lodash/pickBy')
var _isArray = require('lodash/isArray')

function basicGet (obj, pathArray) {
  return pathArray.length ? _get(obj, pathArray) : obj
}

function basicSet (obj, pathArray, value) {
  if (pathArray.length) {
    _set(obj, pathArray, value)
    return obj
  }
  return value
}

function set (obj, path, args) {
  var value = args[0]
  return basicSet(obj, path, value)
}

function del (obj, path) {
  var pathArray = _toPath(path)
  var parentObj = basicGet(obj, pathArray.slice(0, -1))
  delete parentObj[pathArray[pathArray.length - 1]]
  return obj
}

function _transform (obj, path, func) {
  var objToTransform = basicGet(obj, path)
  return basicSet(obj, path, func(objToTransform, obj))
}

function transform (obj, path, args) {
  var func = args[0]
  return _transform(obj, path, func)
}

function map (obj, path, args) {
  var func = args[0]
  return _transform(obj, path, function (item) {
    if (_isArray(item)) {
      return _map(item, func)
    } else if (_isPlainObject(item)) {
      return _mapValues(item, func)
    } else {
      return func(item)
    }
  })
}

function filter (obj, path, args) {
  var func = args[0]
  return _transform(obj, path, function (item) {
    if (_isArray(item)) {
      return _filter(item, func)
    } else if (_isPlainObject(item)) {
      return _pickBy(item, func)
    } else {
      return func(item) ? item : undefined
    }
  })
}

function append (obj, path, args) {
  var arr = args[0]
  return _transform(obj, path, function (item) {
    if (_isArray(item)) {
      return item.concat(arr)
    } else {
      return [item].concat(arr)
    }
  })
}

function prepend (obj, path, args) {
  var arr = args[0]
  return _transform(obj, path, function (item) {
    if (_isArray(item)) {
      return arr.concat(item)
    } else {
      return arr.concat([item])
    }
  })
}

function insert (obj, path, args) {
  var arr = args[0]
  var index = args[1] || 0

  return _transform(obj, path, function (item) {
    var head, tail
    if (_isArray(item)) {
      head = item.slice(0, index)
      tail = item.slice(index)
      return [].concat(head, arr, tail)
    } else {
      return arr.concat([item])
    }
  })
}

function merge (obj, path, args) {
  var objToMerge = args[0]
  return _transform(obj, path, function (item) {
    if (_isPlainObject(item)) {
      return _assign({}, item, objToMerge)
    }
    return item
  })
}

function slice (obj, path, args) {
  var begin = args[0]
  var end = args[1]
  return _transform(obj, path, function (item) {
    if (_isArray(item)) {
      return item.slice(begin, end)
    } else {
      return item
    }
  })
}

function removeKeys (obj, path, args) {
  var keys = _isArray(args[0]) ? args[0] : [args[0]]
  return filter(obj, path, [function (value, key) {
    return !_includes(keys, key)
  }])
}

function removeValues (obj, path, args) {
  var values = _isArray(args[0]) ? args[0] : [args[0]]
  return filter(obj, path, [function (value, key) {
    return !_includes(values, value)
  }])
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
  removeIndexes: removeKeys,
  removeKeys: removeKeys,
  removeValues: removeValues
}
