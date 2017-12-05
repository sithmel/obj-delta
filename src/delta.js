var _isArray = require('lodash/isArray')
var smartClone = require('./smartClone')
var commands = require('./commands')
var addToChangeTree = require('./addToChangeTree')
var loadDiff = require('./loadDiff')
var _includes = require('lodash/includes')

var nonSerializable = ['map', 'transform', 'filter']

function Delta (diff) {
  if (!(this instanceof Delta)) {
    return new Delta(diff)
  }
  diff = typeof diff === 'string' ? JSON.parse(diff) : diff
  this._diff = diff || []
  this.changeTree = {}
  this.serializable = true
  for (var i = 0; i < this._diff; i++) {
    if (_includes(nonSerializable, this._diff[i].c)) this.serializable = false
    addToChangeTree(this.changeTree, this._diff[i].p)
  }
}

Delta.prototype.apply = function apply (obj) {
  var newObj = smartClone(obj, this.changeTree)
  for (var i = 0; i < this._diff.length; i++) {
    commands[this._diff[i].c](newObj, this._diff[i].p, this._diff[i].args)
  }
  return newObj
}

// TODO ERROR return only an object NO stringify!!!
Delta.prototype.toJSON = function toJSON () {
  if (this.serializable) {
    return this._diff
  }
  throw new Error('You cannot serialize a delta object containing functions (like transform, filter, map, etc.)')
}

Delta.prototype._addCommand = function _addCommand (command, path, args) {
  if (typeof path !== 'string' && !_isArray(path)) {
    throw new Error('The path can be either a string "a.b" or an array ["a", "b"]')
  }
  this._diff.push({ c: command, p: path, args: args })
  if (_includes(nonSerializable, command)) this.serializable = false
  addToChangeTree(this.changeTree, path)
  return this
}

// *********************
// queue commands
// *********************

Object.keys(commands).forEach(function (commandName) {
  Delta.prototype[commandName] = function (path) {
    var args = Array.prototype.slice.call(arguments, 1)
    return this._addCommand(commandName, path, args)
  }
})

// *********************
// diff
// *********************

Delta.prototype.diff = function diff (oldObject, newObject, getKey) {
  getKey = getKey || function () {}
  var path = []
  loadDiff(path, oldObject, newObject, this, getKey)
}

module.exports = Delta
