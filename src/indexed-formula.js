'use strict'
const BlankNode = require('./blank-node')
const ClassOrder = require('./class-order')
const Collection = require('./collection')
const Literal = require('./literal')
const log = require('./log')
const NamedNode = require('./named-node')
const Node = require('./node')
const Serializer = require('./serialize')
const Statement = require('./statement')
const Variable = require('./variable')
const ArrayIndexOf = require('./util').ArrayIndexOf
const Loki = require('lokijs')

const owl_ns = 'http://www.w3.org/2002/07/owl#'
let termsMap = [ 'subject', 'predicate', 'object', 'graph', 'statement' ]
// INDEXED_FORMULA functions
// Handle Functional Property
function handle_FP (formula, subj, pred, obj) {
  var o1 = formula.any(subj, pred, undefined)
  if (!o1) {
    return false // First time with this value
  }
  // log.warn("Equating "+o1.uri+" and "+obj.uri + " because FP "+pred.uri);  //@@
  formula.equate(o1, obj)
  return true
} // handle_FP

// Handle Inverse Functional Property
function handle_IFP (formula, subj, pred, obj) {
  var s1 = formula.any(undefined, pred, obj)
  if (!s1) {
    return false // First time with this value
  }
  // log.warn("Equating "+s1.uri+" and "+subj.uri + " because IFP "+pred.uri);  //@@
  formula.equate(s1, subj)
  return true
} // handle_IFP

function handleRDFType (formula, subj, pred, obj, why) {
  if (formula.typeCallback) {
    formula.typeCallback(formula, obj, why)
  }

  var x = formula.classActions[obj.hashString()]
  var done = false
  if (x) {
    for (var i = 0; i < x.length; i++) {
      done = done || x[i](formula, subj, pred, obj, why)
    }
  }
  return done // statement given is not needed if true
}

class FormulaWithLoki extends Node {
  constructor (statements, constraints, initBindings, optional, features) {
    super()
    this.termType = FormulaWithLoki.termType
    /** @private */
    let rn = Math.floor(Math.random() * 100000)
    this.dbname = 'formula' + rn + '.json'
    this.db = new Loki(this.dbname)
    /** @private */
    this.statements = this.db.addCollection('statements')
    if (statements) { this.addAll(statements) }
    this.constraints = constraints
    this.initBindings = initBindings
    this.optional = optional
    this.propertyActions = [] // Array of functions to call when getting statement with {s X o}
    // maps <uri> to [f(F,s,p,o),...]
    this.classActions = [] // Array of functions to call when adding { s type X }
    this.redirections = [] // redirect to lexically smaller equivalent symbol
    this.aliases = [] // reverse mapping to redirection: aliases for this
    this.HTTPRedirects = [] // redirections we got from HTTP
    this.namespaces = {} // Dictionary of namespace prefixes
    this.features = features || [
      'sameAs',
      'InverseFunctionalProperty',
      'FunctionalProperty'
    ]
    this.initPropertyActions(this.features)
  }
  /**
   * Add a statement to the formula. Takes s, p, o and g as arguments.
   * @public
   * @param {any} s
   * @param {any} p
   * @param {any} o
   * @param {any} g
   * @returns
   *
   * @memberOf Formula
   */
  add (s, p, o, g) {
    // NOTE: DataContainerManipulator
    let st = new Statement(s, p, o, g)
    return this.addStatement(st)
  }

  index () {
    this.statements.ensureIndex('subject', true)
    this.statements.ensureIndex('predicate', true)
    this.statements.ensureIndex('object', true)
  }
  /**
   * Add a statement object to the formula.
   * @public
   * @param {any} st
   * @returns
   *
   * @memberOf Formula
   */
  addStatement (st) {
    // NOTE: DataContainerManipulator
    let entry = {
      subject: st.subject.toCanonical(),
      predicate: st.predicate.toCanonical(),
      object: st.object.toCanonical(),
      graph: st.why.toCanonical(),
      statement: st
    }
    return this.statements.insert(entry)
  }

  /**
   * @public
   * Add an array of Statements to the store
   * @param {any} sts
   *
   * @memberOf Formula
   */
  addAll (sts) {
    // NOTE: DataContainerManipulator
    sts.forEach((st) => { this.addStatement(st) })
  }
  /**
   * @public
   * Return a new (unique) BlankNode
   * @param {any} id
   * @returns
   *
   * @memberOf Formula
   */
  bnode (id) {
    return new BlankNode(id)
  }
  /**
   * Finds the types in the list which have no *stored* subtypes
   * These are a set of classes which provide by themselves complete
   * information -- the other classes are redundant for those who
   * know the class DAG.
   */
  bottomTypeURIs (types) {
    var bots
    var bottom
    var elt
    var i
    var k
    var len
    var ref
    var subs
    var v
    bots = []
    for (k in types) {
      if (!types.hasOwnProperty(k)) continue
      v = types[k]
      subs = this.each(void 0, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), this.sym(k))
      bottom = true
      i = 0
      for (len = subs.length; i < len; i++) {
        elt = subs[i]
        ref = elt.uri
        if (ref in types) { // the subclass is one we know
          bottom = false
          break
        }
      }
      if (bottom) {
        bots[k] = v
      }
    }
    return bots
  }

  collection () {
    return new Collection()
  }

  getStatements () {
    // NOTE: DataContainerManipulator
    return this.statements.mapReduce((st) => {
      return st.statement
    }, (array) => {
      var sts = []
      for (let w of array) {
        sts.push(w)
      }
      return sts
    })
  }

  /**
   * @public
   * Queue the store for the given statements. Use null as wildcards. Returns an array of statements.
   * @param {any} subj
   * @param {any} pred
   * @param {any} obj
   * @param {any} why
   * @param {any} justOne
   * @returns {Statement[]}
   *
   * @memberOf Formula
   */
  statementsMatching (subj, pred, obj, why, justOne) {
    // NOTE: DataContainerManipulator
    // log.debug("Matching {"+subj+" "+pred+" "+obj+"}")
    var pat = [ subj, pred, obj, why ]
    var pattern = []
    var given = [] // Not wild
    var list
    var query = {}
    for (let p = 0; p < 4; p++) {
      pattern[p] = this.canon(Node.fromValue(pat[p]))
      if (!pattern[p]) {
      } else {
        given.push(p)
      }
    }
    if (given.length === 0) {
      return this.getStatements()
    } else
    if (given.length === 1) { // Easy too, we have an index for that
      let p = given[0]
      query[termsMap[p]] = pattern[p].toCanonical()
    } else {
      let q = []
      for (let p = 0; p < 4; p++) {
        if (pattern[p]) {
          let t = {}
          t[termsMap[p]] = pattern[p].toCanonical()
          q.push(t)
        }
      }
      query = {'$and': q}
    }
    list = this.statements
      .chain()
      .find(query, justOne)
      .mapReduce(
      (st) => {
        return st.statement
      },
      (array) => {
        var sts = []
        for (let w of array) {
          sts.push(w)
        }
        return sts
      }
      )
    list = list || []
    return list
  }

  /**
   * Returns the symbol with canonical URI as smushed
   */
  canon (term) {
    if (!term) {
      return term
    }
    var y = this.redirections[term.hashString()]
    if (!y) {
      return term
    }
    return y
  }

  /**
   * @public
   * Allow to specify a single wildcard(null). Returns an array of elements matching the wildcard.
   *
   * @param {any} s
   * @param {any} p
   * @param {any} o
   * @param {any} g
   * @returns
   *
   * @memberOf Formula
   */
  each (s, p, o, g) {
    var elt, i, l, m, q
    var len, len1, len2, len3
    var results = []
    var sts = this.statementsMatching(s, p, o, g, false)
    if (s == null) {
      for (i = 0, len = sts.length; i < len; i++) {
        elt = sts[i]
        results.push(elt.subject)
      }
    } else if (p == null) {
      for (l = 0, len1 = sts.length; l < len1; l++) {
        elt = sts[l]
        results.push(elt.predicate)
      }
    } else if (o == null) {
      for (m = 0, len2 = sts.length; m < len2; m++) {
        elt = sts[m]
        results.push(elt.object)
      }
    } else if (g == null) {
      for (q = 0, len3 = sts.length; q < len3; q++) {
        elt = sts[q]
        results.push(elt.why)
      }
    }
    return results
  }

  /**
   * @public
   *
   * @param {any} other
   * @returns
   *
   * @memberOf Formula
   */
  equals (other) {
    if (!other) {
      return false
    }
    return this.hashString() === other.hashString()
  }
  /*
  For thisClass or any subclass, anything which has it is its type
  or is the object of something which has the type as its range, or subject
  of something which has the type as its domain
  We don't bother doing subproperty (yet?)as it doesn't seeem to be used much.
  Get all the Classes of which we can RDFS-infer the subject is a member
  @returns a hash of URIs
  */

  /**
   * @public
   * For thisClass or any subclass, anything which has it is its type
   * or is the object of something which has the type as its range, or subject
   * of something which has the type as its domain
   * We don't bother doing subproperty (yet?)as it doesn't seeem to be used
   * much.
   * Get all the Classes of which we can RDFS-infer the subject is a member
   * @return a hash of URIs
   */
  findMembersNT (thisClass) {
    var i
    var l
    var len
    var len1
    var len2
    var len3
    var len4
    var m
    var members
    var pred
    var q
    var ref
    var ref1
    var ref2
    var ref3
    var ref4
    var ref5
    var seeds
    var st
    var t
    var u
    seeds = {}
    seeds[thisClass.toNT()] = true
    members = {}
    ref = this.transitiveClosure(seeds, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), true)
    for (t in ref) {
      if (!ref.hasOwnProperty(t)) continue
      ref1 = this.statementsMatching(void 0,
        this.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        this.fromNT(t))
      for (i = 0, len = ref1.length; i < len; i++) {
        st = ref1[i]
        members[st.subject.toNT()] = st
      }
      ref2 = this.each(void 0,
        this.sym('http://www.w3.org/2000/01/rdf-schema#domain'),
        this.fromNT(t))
      for (l = 0, len1 = ref2.length; l < len1; l++) {
        pred = ref2[l]
        ref3 = this.statementsMatching(void 0, pred)
        for (m = 0, len2 = ref3.length; m < len2; m++) {
          st = ref3[m]
          members[st.subject.toNT()] = st
        }
      }
      ref4 = this.each(void 0,
        this.sym('http://www.w3.org/2000/01/rdf-schema#range'),
        this.fromNT(t))
      for (q = 0, len3 = ref4.length; q < len3; q++) {
        pred = ref4[q]
        ref5 = this.statementsMatching(void 0, pred)
        for (u = 0, len4 = ref5.length; u < len4; u++) {
          st = ref5[u]
          members[st.object.toNT()] = st
        }
      }
    }
    return members
  }
  findMemberURIs (subject) {
    return this.NTtoURI(this.findMembersNT(subject))
  }
  /**
   * Get all the Classes of which we can RDFS-infer the subject is a superclass
   * Returns a hash table where key is NT of type and value is statement why we
   * think so.
   * Does NOT return terms, returns URI strings.
   * We use NT representations in this version because they handle blank nodes.
   */
  findSubClassesNT (subject) {
    var types = {}
    types[subject.toNT()] = true
    return this.transitiveClosure(types,
      this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), true)
  }
  /**
   * Get all the Classes of which we can RDFS-infer the subject is a subclass
   * Returns a hash table where key is NT of type and value is statement why we
   * think so.
   * Does NOT return terms, returns URI strings.
   * We use NT representations in this version because they handle blank nodes.
   */
  findSuperClassesNT (subject) {
    var types = {}
    types[subject.toNT()] = true
    return this.transitiveClosure(types,
      this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), false)
  }
  /**
   * Get all the Classes of which we can RDFS-infer the subject is a member
   * todo: This will loop is there is a class subclass loop (Sublass loops are
   * not illegal)
   * Returns a hash table where key is NT of type and value is statement why we
   * think so.
   * Does NOT return terms, returns URI strings.
   * We use NT representations in this version because they handle blank nodes.
   */
  findTypesNT (subject) {
    var domain
    var i
    var l
    var len
    var len1
    var len2
    var len3
    var m
    var q
    var range
    var rdftype
    var ref
    var ref1
    var ref2
    var ref3
    var st
    var types
    rdftype = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    types = []
    ref = this.statementsMatching(subject, void 0, void 0)
    for (i = 0, len = ref.length; i < len; i++) {
      st = ref[i]
      if (st.predicate.uri === rdftype) {
        types[st.object.toNT()] = st
      } else {
        ref1 = this.each(st.predicate, this.sym('http://www.w3.org/2000/01/rdf-schema#domain'))
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          range = ref1[l]
          types[range.toNT()] = st
        }
      }
    }
    ref2 = this.statementsMatching(void 0, void 0, subject)
    for (m = 0, len2 = ref2.length; m < len2; m++) {
      st = ref2[m]
      ref3 = this.each(st.predicate, this.sym('http://www.w3.org/2000/01/rdf-schema#range'))
      for (q = 0, len3 = ref3.length; q < len3; q++) {
        domain = ref3[q]
        types[domain.toNT()] = st
      }
    }
    return this.transitiveClosure(types, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), false)
  }
  findTypeURIs (subject) {
    return this.NTtoURI(this.findTypesNT(subject))
  }
  // Trace the statements which connect directly, or through bnodes
  // Returns an array of statements
  // doc param may be null to search all documents in store
  connectedStatements (subject, doc, excludePredicateURIs) {
    excludePredicateURIs = excludePredicateURIs || []
    var todo = [ subject ]
    var done = []
    var doneArcs = []
    var result = []
    var self = this
    var follow = function (x) {
      var queue = function (x) {
        if (x.termType === 'BlankNode' && !done[x.value]) {
          done[x.value] = true
          todo.push(x)
        }
      }
      var sts = self.statementsMatching(null, null, x, doc)
        .concat(self.statementsMatching(x, null, null, doc))
      sts = sts.filter(function (st) {
        if (excludePredicateURIs[st.predicate.uri]) return false
        var hash = st.toNT()
        if (doneArcs[hash]) return false
        doneArcs[hash] = true
        return true
      }
      )
      sts.forEach(function (st, i) {
        queue(st.subject)
        queue(st.object)
      })
      result = result.concat(sts)
    }
    while (todo.length) {
      follow(todo.shift())
    }
    // console.log('' + result.length + ' statements about ' + subject)
    return result
  }

  formula () {
    return new FormulaWithLoki()
  }
  /**
   * Transforms an NTriples string format into a Node.
   * The bnode bit should not be used on program-external values; designed
   * for internal work such as storing a bnode id in an HTML attribute.
   * This will only parse the strings generated by the vaious toNT() methods.
   */
  fromNT (str) {
    // NOTE: this shouldnt really belong here.
    var dt, k, lang, x
    switch (str[0]) {
      case '<':
        return this.sym(str.slice(1, -1))
      case '"':
        lang = void 0
        dt = void 0
        k = str.lastIndexOf('"')
        if (k < str.length - 1) {
          if (str[k + 1] === '@') {
            lang = str.slice(k + 2)
          } else if (str.slice(k + 1, k + 3) === '^^') {
            dt = this.fromNT(str.slice(k + 3))
          } else {
            throw new Error("Can't convert string from NT: " + str)
          }
        }
        str = str.slice(1, k)
        str = str.replace(/\\"/g, '"')
        str = str.replace(/\\n/g, '\n')
        str = str.replace(/\\\\/g, '\\')
        return this.literal(str, lang, dt)
      case '_':
        x = new BlankNode()
        x.id = parseInt(str.slice(3), 10)
        BlankNode.nextId--
        return x
      case '?':
        return new Variable(str.slice(1))
    }
    throw new Error("Can't convert from NT: " + str)
  }

  /**
   * @public
   *
   * @param {any} s
   * @param {any} p
   * @param {any} o
   * @param {any} g
   * @returns
   *
   * @memberOf Formula
   */
  holds (s, p, o, g) {
    var i
    if (arguments.length === 1) {
      if (!s) {
        return true
      }
      if (s instanceof Array) {
        for (i = 0; i < s.length; i++) {
          if (!this.holds(s[i])) {
            return false
          }
        }
        return true
      } else if (s instanceof Statement) {
        return this.holds(s.subject, s.predicate, s.object, s.why)
      } else if (s.statements) {
        return this.holds(s.statements)
      }
    }

    var st = this.anyStatementMatching(s, p, o, g)
    return st != null
  }

  any (s, p, o, g) {
    var st = this.anyStatementMatching(s, p, o, g)
    if (st == null) {
      return void 0
    } else if (s == null) {
      return st.subject
    } else if (p == null) {
      return st.predicate
    } else if (o == null) {
      return st.object
    }
    return void 0
  }

  anyValue (s, p, o, g) {
    var y = this.any(s, p, o, g)
    return y ? y.value : void 0
  }

  anyStatementMatching (subj, pred, obj, why) {
    var x = this.statementsMatching(subj, pred, obj, why, true)
    if (!x || x.length === 0) {
      return undefined
    }
    return x[0]
  }
  /**
   * @public
   *
   * @param {any} st
   * @returns
   *
   * @memberOf Formula
   */
  holdsStatement (st) {
    return this.holds(st.subject, st.predicate, st.object, st.why)
  }

  list (values) {
    let collection = new Collection()
    values.forEach(function (val) {
      collection.append(val)
    })
    return collection
  }
  literal (val, lang, dt) {
    return new Literal('' + val, lang, dt)
  }
  /**
   * transform a collection of NTriple URIs into their URI strings
   * @param t some iterable colletion of NTriple URI strings
   * @return a collection of the URIs as strings
   * todo: explain why it is important to go through NT
   */
  NTtoURI (t) {
    var k, v
    var uris = {}
    for (k in t) {
      if (!t.hasOwnProperty(k)) continue
      v = t[k]
      if (k[0] === '<') {
        uris[k.slice(1, -1)] = v
      }
    }
    return uris
  }

  serialize (base, contentType, provenance) {
    var documentString
    var sts
    var sz
    sz = Serializer(this)
    sz.suggestNamespaces(this.namespaces)
    sz.setBase(base)
    if (provenance) {
      sts = this.statementsMatching(void 0, void 0, void 0, provenance)
    } else {
      sts = this.statementsMatching(void 0, void 0, void 0, null)
    }
    switch (
    contentType != null ? contentType : 'text/n3') {
      case 'application/rdf+xml':
        documentString = sz.statementsToXML(sts)
        break
      case 'text/n3':
      case 'text/turtle':
        documentString = sz.statementsToN3(sts)
        break
      default:
        throw new Error('serialize: Content-type ' + contentType +
          ' not supported.')
    }
    return documentString
  }

  substitute (bindings) {
    var statementsCopy = this.statementsMatching().map(function (ea) {
      return ea.substitute(bindings)
    })
    console.log('Formula subs statements:' + statementsCopy)
    var y = new FormulaWithLoki()
    y.addAll(statementsCopy)
    console.log('indexed-form subs formula:' + y)
    return y
  }

  sym (uri, name) {
    if (name) {
      throw new Error('This feature (kb.sym with 2 args) is removed. Do not assume prefix mappings.')
    }
    return new NamedNode(uri)
  }

  the (s, p, o, g) {
    var x = this.any(s, p, o, g)
    if (x == null) {
      log.error('No value found for the() {' + s + ' ' + p + ' ' + o + '}.')
    }
    return x
  }
  /**
   * RDFS Inference
   * These are hand-written implementations of a backward-chaining reasoner
   * over the RDFS axioms.
   * @param seeds {Object} a hash of NTs of classes to start with
   * @param predicate The property to trace though
   * @param inverse trace inverse direction
   */
  transitiveClosure (seeds, predicate, inverse) {
    var elt, i, len, s, sups, t
    var agenda = {}
    Object.assign(agenda, seeds)  // make a copy
    var done = {}  // classes we have looked up
    while (true) {
      t = (function () {
        for (var p in agenda) {
          if (!agenda.hasOwnProperty(p)) continue
          return p
        }
      })()
      if (t == null) {
        return done
      }
      sups = inverse ? this.each(void 0, predicate, this.fromNT(t)) : this.each(this.fromNT(t), predicate)
      for (i = 0, len = sups.length; i < len; i++) {
        elt = sups[i]
        s = elt.toNT()
        if (s in done) {
          continue
        }
        if (s in agenda) {
          continue
        }
        agenda[s] = agenda[t]
      }
      done[t] = agenda[t]
      delete agenda[t]
    }
  }
  /**
   * Finds the types in the list which have no *stored* supertypes
   * We exclude the universal class, owl:Things and rdf:Resource, as it is
   * information-free.
   */
  topTypeURIs (types) {
    var i
    var j
    var k
    var len
    var n
    var ref
    var tops
    var v
    tops = []
    for (k in types) {
      if (!types.hasOwnProperty(k)) continue
      v = types[k]
      n = 0
      ref = this.each(this.sym(k), this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'))
      for (i = 0, len = ref.length; i < len; i++) {
        j = ref[i]
        if (j.uri !== 'http://www.w3.org/2000/01/rdf-schema#Resource') {
          n++
          break
        }
      }
      if (!n) {
        tops[k] = v
      }
    }
    if (tops['http://www.w3.org/2000/01/rdf-schema#Resource']) {
      delete tops['http://www.w3.org/2000/01/rdf-schema#Resource']
    }
    if (tops['http://www.w3.org/2002/07/owl#Thing']) {
      delete tops['http://www.w3.org/2002/07/owl#Thing']
    }
    return tops
  }
  toString () {
    return '{' + this.statementsMatching().join('\n') + '}'
  }
  whether (s, p, o, g) {
    return this.statementsMatching(s, p, o, g, false).length
  }

  // -------------------------------------------------
  // INDEXED-FORMULA methods

  applyPatch (patch, target, patchCallback) { // patchCallback(err)
    const Query = require('./query').Query
    var targetKB = this
    var ds
    var binding = null

    // /////////// Debug strings
    /*
    var bindingDebug = function (b) {
      var str = ''
      var v
      for (v in b) {
        if (b.hasOwnProperty(v)) {
          str += '    ' + v + ' -> ' + b[v]
        }
      }
      return str
    }
*/
    var doPatch = function (onDonePatch) {
      if (patch['delete']) {
        ds = patch['delete']
        // console.log(bindingDebug(binding))
        // console.log('ds before substitute: ' + ds)
        if (binding) { ds = ds.substitute(binding) }
        // console.log('applyPatch: delete: ' + ds)
        ds = ds.statements
        var bad = []
        var ds2 = ds.map(function (st) { // Find the actual statemnts in the store
          var sts = targetKB.statementsMatching(st.subject, st.predicate, st.object, target)
          if (sts.length === 0) {
            // log.info("NOT FOUND deletable " + st)
            bad.push(st)
            return null
          } else {
            // log.info("Found deletable " + st)
            return sts[0]
          }
        })
        if (bad.length) {
          // console.log('Could not find to delete ' + bad.length + 'statements')
          // console.log('despite ' + targetKB.statementsMatching(bad[0].subject, bad[0].predicate)[0])
          return patchCallback('Could not find to delete: ' + bad.join('\n or '))
        }
        ds2.map(function (st) {
          targetKB.remove(st)
        })
      }
      if (patch['insert']) {
        // log.info("doPatch insert "+patch['insert'])
        ds = patch['insert']
        if (binding) ds = ds.substitute(binding)
        ds = ds.statements
        ds.map(function (st) {
          st.why = target
          targetKB.add(st.subject, st.predicate, st.object, st.why)
        })
      }
      onDonePatch()
    }
    if (patch.where) {
      // log.info("Processing WHERE: " + patch.where + '\n')
      var query = new Query('patch')
      query.pat = patch.where
      query.pat.statements.map(function (st) {
        st.why = target
      })

      var bindingsFound = []

      targetKB.query(query, function onBinding (binding) {
        bindingsFound.push(binding)
        // console.log('   got a binding: ' + bindingDebug(binding))
      },
        targetKB.fetcher,
        function onDone () {
          if (bindingsFound.length === 0) {
            return patchCallback('No match found to be patched:' + patch.where)
          }
          if (bindingsFound.length > 1) {
            return patchCallback('Patch ambiguous. No patch done.')
          }
          binding = bindingsFound[0]
          doPatch(patchCallback)
        })
    } else {
      doPatch(patchCallback)
    }
  }

  declareExistential (x) {
    if (!this._existentialVariables) this._existentialVariables = []
    this._existentialVariables.push(x)
    return x
  }

  initPropertyActions (features) {
    // If the predicate is #type, use handleRDFType to create a typeCallback on the object
    this.propertyActions['<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>'] =
      [ handleRDFType ]

    // Assumption: these terms are not redirected @@fixme
    if (ArrayIndexOf(features, 'sameAs') >= 0) {
      this.propertyActions['<http://www.w3.org/2002/07/owl#sameAs>'] = [
        function (formula, subj, pred, obj, why) {
          // log.warn("Equating "+subj.uri+" sameAs "+obj.uri);  //@@
          formula.equate(subj, obj)
          return true // true if statement given is NOT needed in the store
        }
      ] // sameAs -> equate & don't add to index
    }
    if (ArrayIndexOf(features, 'InverseFunctionalProperty') >= 0) {
      this.classActions['<' + owl_ns + 'InverseFunctionalProperty>'] = [
        function (formula, subj, pred, obj, addFn) {
          // yes subj not pred!
          return formula.newPropertyAction(subj, handle_IFP)
        }
      ] // IFP -> handle_IFP, do add to index
    }
    if (ArrayIndexOf(features, 'FunctionalProperty') >= 0) {
      this.classActions['<' + owl_ns + 'FunctionalProperty>'] = [
        function (formula, subj, proj, obj, addFn) {
          return formula.newPropertyAction(subj, handle_FP)
        }
      ] // FP => handleFP, do add to index
    }
  }

  /**
   * replaces @template with @target and add appropriate triples (no triple
   * removed)
   * one-direction replication
   * @method copyTo
   */
  copyTo (template, target, flags) {
    if (!flags) flags = []
    var statList = this.statementsMatching(template)
    if (ArrayIndexOf(flags, 'two-direction') !== -1) {
      statList.concat(this.statementsMatching(undefined, undefined, template))
    }
    for (var i = 0; i < statList.length; i++) {
      var st = statList[i]
      switch (st.object.termType) {
        case 'NamedNode':
          this.add(target, st.predicate, st.object)
          break
        case 'Literal':
        case 'BlankNode':
        case 'Collection':
          this.add(target, st.predicate, st.object.copy(this))
      }
      if (ArrayIndexOf(flags, 'delete') !== -1) {
        this.remove(st)
      }
    }
  }

  /**
   * simplify graph in store when we realize two identifiers are equivalent
   * We replace the bigger with the smaller.
   */
  equate (u1, u2) {
    // log.warn("Equating "+u1+" and "+u2); // @@
    // @@JAMBO Must canonicalize the uris to prevent errors from a=b=c
    // 03-21-2010
    u1 = this.canon(u1)
    u2 = this.canon(u2)
    var d = u1.compareTerm(u2)
    if (!d) {
      return true // No information in {a = a}
    }
    // var big
    // var small
    if (d < 0) { // u1 less than u2
      return this.replaceWith(u2, u1)
    } else {
      return this.replaceWith(u1, u2)
    }
  }
  /**
 * Returns the number of statements contained in this IndexedFormula.
 * (Getter proxy to this.statements).
 * Usage:
 *    ```
 *    var kb = rdf.graph()
 *    kb.length  // -> 0
 *    ```
 * @return {Number}
 */
  length () {
    // NOTE: DataContainerManipulator
    return this.statements.count()
  }

  /**
   * Returns any quads matching the given arguments.
   * Standard RDFJS Taskforce method for Source objects, implemented as an
   * alias to `statementsMatching()`
   * @method match
   * @param subject {Node|String|Object}
   * @param predicate {Node|String|Object}
   * @param object {Node|String|Object}
   * @param graph {NamedNode|String}
   */
  match (subject, predicate, object, graph) {
    return this.statementsMatching(
      Node.fromValue(subject),
      Node.fromValue(predicate),
      Node.fromValue(object),
      Node.fromValue(graph)
    )
  }

  /**
   * Find out whether a given URI is used as symbol in the formula
   */
  mentionsURI (uri) {
    var hash = '<' + uri + '>'
    return (!!this.subjectIndex.get(hash) ||
      !!this.objectIndex.get(hash) ||
      !!this.predicateIndex.get(hash))
  }

  // Existentials are BNodes - something exists without naming
  newExistential (uri) {
    if (!uri) return this.bnode()
    var x = this.sym(uri)
    return this.declareExistential(x)
  }

  newPropertyAction (pred, action) {
    // log.debug("newPropertyAction:  "+pred)
    var hash = pred.hashString()
    if (!this.propertyActions[hash]) {
      this.propertyActions[hash] = []
    }
    this.propertyActions[hash].push(action)
    // Now apply the function to to statements already in the store
    var toBeFixed = this.statementsMatching(undefined, pred, undefined)
    var done = false
    for (var i = 0; i < toBeFixed.length; i++) { // NOT optimized - sort toBeFixed etc
      done = done || action(this, toBeFixed[i].subject, pred, toBeFixed[i].object)
    }
    return done
  }

  // Universals are Variables
  newUniversal (uri) {
    var x = this.sym(uri)
    if (!this._universalVariables) this._universalVariables = []
    this._universalVariables.push(x)
    return x
  }

  // convenience function used by N3 parser
  variable (name) {
    return new Variable(name)
  }

  /**
   * Find an unused id for a file being edited: return a symbol
   * (Note: Slow iff a lot of them -- could be O(log(k)) )
   */
  nextSymbol (doc) {
    for (var i = 0; ;i++) {
      var uri = doc.uri + '#n' + i
      if (!this.mentionsURI(uri)) return this.sym(uri)
    }
  }

  query (myQuery, callback, fetcher, onDone) {
    let indexedFormulaQuery = require('./query').indexedFormulaQuery
    return indexedFormulaQuery.call(this, myQuery, callback, fetcher, onDone)
  }

   /**
   * Finds a statement object and removes it
   */
  remove (st) {
    if (st instanceof Array) {
      for (let stat of st) {
        this.remove(stat)
      }
      return this
    }
    if (st instanceof FormulaWithLoki) {
      return this.remove(st.statements())
    }
    var sts = this.statementsMatching(st.subject, st.predicate, st.object,
      st.why)
    if (!sts.length) {
      throw new Error('Statement to be removed is not on store: ' + st)
    }
    this.removeStatement(sts[0])
    return this
  }

  /**
   * Removes all statemnts in a doc
   */
  removeDocument (doc) {
    var sts = this.statementsMatching(undefined, undefined, undefined, doc).slice() // Take a copy as this is the actual index
    for (var i = 0; i < sts.length; i++) {
      this.removeStatement(sts[i])
    }
    return this
  }

  /**
   * remove all statements matching args (within limit) *
   */
  removeMany (subj, pred, obj, why, limit) {
    // log.debug("entering removeMany w/ subj,pred,obj,why,limit = " + subj +", "+ pred+", " + obj+", " + why+", " + limit)
    var sts = this.statementsMatching(subj, pred, obj, why, false)
    // This is a subtle bug that occcured in updateCenter.js too.
    // The fact is, this.statementsMatching returns this.whyIndex instead of a copy of it
    // but for perfromance consideration, it's better to just do that
    // so make a copy here.
    var statements = []
    for (var i = 0; i < sts.length; i++) statements.push(sts[i])
    if (limit) statements = statements.slice(0, limit)
    for (i = 0; i < statements.length; i++) this.remove(statements[i])
  }

  removeMatches (subject, predicate, object, why) {
    this.removeStatements(this.statementsMatching(subject, predicate, object,
      why))
    return this
  }

  /**
   * Remove a particular statement object from the store
   *
   * st    a statement which is already in the store and indexed.
   *      Make sure you only use this for these.
   *    Otherwise, you should use remove() above.
   */
  removeStatement (st) {
    // NOTE: DataContainerManipulator
    var term = [ st.subject, st.predicate, st.object, st.why ]
    let statDoc
    for (var p = 0; p < 4; p++) {
      statDoc[termsMap[p]] = this.canon(term[p])
    }
    this.statements.remove(statDoc)
    return this
  }

  removeStatements (sts) {
    for (let st of sts) {
      this.removeStatement(st)
    }
    return this
  }

  /**
   * Replace big with small, obsoleted with obsoleting.
   */
  replaceWith (big, small) {
    // log.debug("Replacing "+big+" with "+small) // @@
    var oldhash = big.hashString()
    var newhash = small.hashString()
    var moveIndex = function (ix) {
      var oldlist = ix.get(oldhash)
      if (!oldlist) {
        return // none to move
      }
      var newlist = ix.get(newhash)
      if (!newlist) {
        ix.set(newhash, oldlist)
      } else {
        ix.set(newhash, oldlist.concat(newlist))
      }
      ix.delete(oldhash)
    }
    var updateActions = function (actions) {
      var oldlist = actions[oldhash]
      if (!oldlist) {
        return // none to move
      }
      var newlist = actions[newhash]
      if (!newlist) {
        actions[newhash] = oldlist
      } else {
        actions[newhash] = oldlist.concat(newlist)
      }
      delete actions[oldhash]
    }
    // the canonical one carries all the indexes
    for (var i = 0; i < 4; i++) {
      moveIndex(this.index[i])
    }
    this.redirections[oldhash] = small
    if (big.uri) {
      // @@JAMBO: must update redirections,aliases from sub-items, too.
      if (!this.aliases[newhash]) {
        this.aliases[newhash] = []
      }
      this.aliases[newhash].push(big) // Back link
      if (this.aliases[oldhash]) {
        for (i = 0; i < this.aliases[oldhash].length; i++) {
          this.redirections[this.aliases[oldhash][i].hashString()] = small
          this.aliases[newhash].push(this.aliases[oldhash][i])
        }
      }
      this.add(small, this.sym('http://www.w3.org/2007/ont/link#uri'), big.uri)
      // If two things are equal, and one is requested, we should request the other.
      if (this.fetcher) {
        this.fetcher.nowKnownAs(big, small)
      }
    }
    updateActions(this.classActions)
    updateActions(this.propertyActions)
    // log.debug("Equate done. "+big+" to be known as "+small)
    return true // true means the statement does not need to be put in
  }

  /**
   * Return all equivalent URIs by which this is known
   */
  allAliases (x) {
    var a = this.aliases[this.canon(x).hashString()] || []
    a.push(this.canon(x))
    return a
  }

  /**
   * Compare by canonical URI as smushed
   */
  sameThings (x, y) {
    if (x.sameTerm(y)) {
      return true
    }
    var x1 = this.canon(x)
    //    alert('x1='+x1)
    if (!x1) return false
    var y1 = this.canon(y)
    //    alert('y1='+y1); //@@
    if (!y1) return false
    return (x1.uri === y1.uri)
  }

  setPrefixForURI (prefix, nsuri) {
    // TODO: This is a hack for our own issues, which ought to be fixed
    // post-release
    // See http://dig.csail.mit.edu/cgi-bin/roundup.cgi/$rdf/issue227
    if (prefix === 'tab' && this.namespaces['tab']) {
      return
    } // There are files around with long badly generated prefixes like this
    if (prefix.slice(0, 2) === 'ns' || prefix.slice(0, 7) === 'default') {
      return
    }
    this.namespaces[prefix] = nsuri
  }

   /**
   *  A list of all the URIs by which this thing is known
   */
  uris (term) {
    var cterm = this.canon(term)
    var terms = this.aliases[cterm.hashString()]
    if (!cterm.uri) return []
    var res = [ cterm.uri ]
    if (terms) {
      for (var i = 0; i < terms.length; i++) {
        res.push(terms[i].uri)
      }
    }
    return res
  }
}

FormulaWithLoki.termType = 'Graph'

FormulaWithLoki.prototype.classOrder = ClassOrder['Graph']
FormulaWithLoki.prototype.isVar = 0

FormulaWithLoki.prototype.ns = require('./namespace')
FormulaWithLoki.prototype.variable = name => new Variable(name)

module.exports = FormulaWithLoki
