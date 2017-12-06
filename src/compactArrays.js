var _isArray = require('lodash/isArray')
var _remove = require('lodash/remove')

function compactArrays (obj, changeTree) {
  if (!changeTree) return
  for (var key in obj) {
    compactArrays(obj[key], changeTree[key])
  }
  if (_isArray(obj)) {
    _remove(obj, (item, index, arr) => !(index in arr)) // compact sparse arrays
  }
}

module.exports = compactArrays
