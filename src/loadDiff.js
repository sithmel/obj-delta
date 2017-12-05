var _isArray = require('lodash/isArray')
var _isPlainObject = require('lodash/isPlainObject')
var _isUndefined = require('lodash/isUndefined')
// var _assign = require('lodash/assign')

function getObjType (obj) {
  if (_isArray(obj)) {
    return 'array'
  } else if (_isPlainObject(obj)) {
    return 'object'
  } else {
    return 'scalar'
  }
}

function loadDiffArray (path, oldObject, newObject, delta, getKey) {
  var keyGetter = function (value, index) {
    var key = getKey(value, path.concat(index))
    return {
      key: _isUndefined(key) ? index : key,
      index: index,
      value: value
    }
  }
  var reducer = function (acc, obj) {
    acc[obj.key] = obj
    return obj
  }
  var oldObjectKeys = oldObject.map(keyGetter).reduce(reducer, {})
  var newObjectKeys = newObject.map(keyGetter).reduce(reducer, {})
  // items to remove
  for (var k in oldObjectKeys) {
    if (!(k in newObjectKeys)) {
      // delta.del(path.concat(k));
    }
  }
}

function loadDiffObj (path, oldObject, newObject, delta, getKey) {
  // items to remove
  for (var key in oldObject) {
    if (!(key in newObject)) {
      delta.del(path.concat(key))
    }
  }
  // items to add
  for (var k in newObject) {
    if (k in oldObject) {
      loadDiff(path.concat(k), oldObject[k], newObject[k], delta, getKey)
    } else {
      delta.set(path.concat(k), newObject[k])
    }
  }
}

function loadDiff (path, oldObject, newObject, delta, getKey) {
  var newObjType = getObjType(newObject)
  var oldObjType = getObjType(oldObject)
  // different type
  if (oldObjType !== newObjType) {
    delta.set(path, newObject)
  } else if (oldObjType === 'scalar') {
    // both scalar
    if (oldObject !== newObject) {
      delta.set(path, newObject)
    }
  } else if (oldObjType === 'array') {
    loadDiffArray(path, oldObject, newObject, delta, getKey)
  } else {
    loadDiffObj(path, oldObject, newObject, delta, getKey)
  }
}

module.exports = loadDiff
