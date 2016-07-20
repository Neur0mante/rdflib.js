'use strict'
/**
 * The superclass of all RDF Statement objects, that is
 * NamedNode, Literal, BlankNode, etc.
 * @class Node
 */
class Node {
  substitute (bindings) {
    return this
  }
  compareTerm (other) {
    if (this.classOrder < other.classOrder) {
      return -1
    }
    if (this.classOrder > other.classOrder) {
      return +1
    }
    if (this.value < other.value) {
      return -1
    }
    if (this.value > other.value) {
      return +1
    }
    return 0
  }
  equals (other) {
    if (!other) {
      return false
    }
    return (this.termType === other.termType) &&
      (this.value === other.value)
  }
  sameTerm (other) {
    return this.equals(other)
  }
  toCanonical () {
    return this.toNT()
  }
  toNT () {
    return this.toString()
  }
}

module.exports = Node
