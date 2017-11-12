var shallowCopy = require('lodash/clone');

function smartClone(obj, changeTree) {
  var newObj;
  if (!changeTree) {
    return obj;
  } else {
    newObj = shallowCopy(obj);
    for (var key in newObj) {
      newObj[key] = smartClone(newObj[key], changeTree[key]);
    }
    return newObj;
  }
}

module.exports = smartClone;
