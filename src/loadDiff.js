var _isArray = require('lodash/isArray');
var _isPlainObject = require('lodash/isPlainObject');

function getObjType(obj) {
  if (_isArray(obj)) {
    return 'array';
  } else if (_isPlainObject(obj)) {
    return 'object';
  } else {
    return 'scalar';
  }
}

function loadDiffArray(path, oldObject, newObject, delta, getKey) {

}

function loadDiffObj(path, oldObject, newObject, delta, getKey) {
  // items to remove
  for (var k in oldObject) {
    if (!(k in newObject)) {
      delta.del(path.concat(k));
    }
  }
  // items to add
  for (var k in newObject) {
    if (k in oldObject) {
      loadDiff(path.concat(k), oldObject[k], newObject[k], delta, getKey);
    } else {
      delta.set(path.concat(k), newObject[k]);
    }
  }
}

function loadDiff(path, oldObject, newObject, delta, getKey) {
  var newObjType = getObjType(newObject);
  var oldObjType = getObjType(oldObject);
  // different type
  if (oldObjType !== newObjType) {
    delta.set(path, newObject);
    return;
  }
  // both scalar
  if (oldObjType === 'scalar') {
    if (oldObject !== newObject) {
      delta.set(path, newObject);
    }
    return;
  }
  if (oldObjType === 'array') {
    loadDiffArray(path, oldObject, newObject, delta, getKey);
  } else {
    loadDiffObj(path, oldObject, newObject, delta, getKey);
  }
}

module.exports = loadDiff;
