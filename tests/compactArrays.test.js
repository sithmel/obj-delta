/* eslint-env node, mocha */
var assert = require('chai').assert
var compactArrays = require('../src/compactArrays')

describe('compactArrays', function () {
  it('compactArrays simple case', function () {
    var obj = { hello: [,,,2, 3, 4], world: {} } // eslint-disable-line
    compactArrays(obj, { hello: true })
    assert.deepEqual(obj, { hello: [2, 3, 4], world: {} })
  })

  it('compactArrays nested case', function () {
    var obj = { hello: [,,,2, [1,,2], 4], world: {} } // eslint-disable-line
    compactArrays(obj, { hello: { 4: true } })
    assert.deepEqual(obj, { hello: [2, [1, 2], 4], world: {} })
  })
})
