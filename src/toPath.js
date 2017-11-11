var ArrayCursor = require('array-cursor');
var isUndefined = require('lodash/isUndefined');
var identity = require('lodash/identity');

function pathStr2Array(s) {
  return s.split(/[.\[\]]/).filter(identity);
}

function toPath(s) {
  var arr;
  if (Array.isArray(s)) {
    arr = s;
  } else if (typeof s === 'string') {
    arr = pathStr2Array(s);
  } else if (isUndefined(s)){
    arr = [];
  } else {
    new Error('Invalid path');
  }
  return new ArrayCursor(arr);
}

module.exports = toPath;
