var groupBy = require('lodash/groupBy');
var shallowCopy = require('lodash/clone');
var isUndefined = require('lodash/isUndefined');

function removeFirstItemFromPath(pathsArray) {
  return pathsArray.map(function (p) {
    return p.slice(1);
  });
}

function getFirstItem(p) {
  return p.get(0);
}

function firstItemIsDefined(p) {
  return !isUndefined(p.get(0));
}

function smartClone(obj, pathsArray) {
  var newObj, groupedByAttr;
  if (pathsArray.length) {
    newObj = shallowCopy(obj);
    groupedByAttr = groupBy(pathsArray.filter(firstItemIsDefined), getFirstItem);
    for (var key in newObj) {
      newObj[key] = smartClone(newObj[key], removeFirstItemFromPath(groupedByAttr[key] || []));
    }
    return newObj;
  } else {
    return obj;
  }
}

module.exports = smartClone;
