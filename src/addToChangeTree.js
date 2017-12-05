var _set = require('lodash/set')
var _get = require('lodash/get')

module.exports = function addToChangeTree (changeTree, path) {
  var value = _get(changeTree, path)
  if (!value) {
    _set(changeTree, path, true)
  }
}
