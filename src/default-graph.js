'use strict'
const Node = require('./node')

class DefaultGraph extends Node {
  constructor () {
    super()
    this.termType = 'DefaultGraph'
    this.value = 'http://default.graph'
  }
  toCanonical () {
    return this.value
  }
}

module.exports = DefaultGraph
