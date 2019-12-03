/* eslint-env node, mocha */
var assert = require('chai').assert
var addToChangeTree = require('../src/addToChangeTree')

describe('addToChangeTree', function () {
  it('add a simple path', function () {
    var changeTree = {}
    addToChangeTree(changeTree, 'hello.world')
    assert.deepEqual(changeTree, { hello: { world: true } })
  })

  it('add 2 paths', function () {
    var changeTree = {}
    addToChangeTree(changeTree, 'hello.world')
    addToChangeTree(changeTree, 'hello.world2')
    assert.deepEqual(changeTree, { hello: { world: true, world2: true } })
  })

  it('add 2 conflicting paths', function () {
    var changeTree = {}
    addToChangeTree(changeTree, 'hello.world')
    addToChangeTree(changeTree, 'hello')
    assert.deepEqual(changeTree, { hello: { world: true } })
  })
})
