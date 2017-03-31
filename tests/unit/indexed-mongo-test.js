/* eslint-env mocha */
import IndexedFormula from '../../src/indexed-formula-promisified-with-mongo'
import NamedNode from '../../src/named-node'
import { triple } from '../../src/data-factory'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

// Chai-as-promised hook
chai.use(chaiAsPromised)
chai.should() // should version
// var expect = chai.expect; // expect version

describe('IndexedFormula', () => {
  describe('match', () => {
    const s1 = NamedNode.fromValue('https://example.com/subject1')
    const p1 = NamedNode.fromValue('https://example.com/predicate1')
    const o1 = NamedNode.fromValue('https://example.com/object1')
    const triple1 = triple(s1, p1, o1)

    const s2 = NamedNode.fromValue('https://example.com/subject2')
    const p2 = NamedNode.fromValue('https://example.com/predicate2')
    const o2 = NamedNode.fromValue('https://example.com/object2')
    const triple2 = triple(s2, p2, o2)

    const s3 = NamedNode.fromValue('https://example.com/subject3')
    const p3 = NamedNode.fromValue('https://example.com/predicate3')
    const o3 = NamedNode.fromValue('https://example.com/object3')
    const triple3 = triple(s3, p3, o3)

    // const triple4 = triple(s1, p2, o3)

    it('should returns all statements when given no arguments', (done) => {
      let formula = new IndexedFormula()

      const triples = [ triple1, triple2, triple3 ]
      console.log(triple1)
      return formula.init()
        .then((kb) => {
          return kb.clearFormula()
            .then(() => {
              return kb.addAll(triples)
            })
            .then(() => {
              return kb.getStatements()
                .then(res => { console.log(res) })
            })
            .then(() => {
              return kb.length().should.eventually.equal(3)
            })
            .then(() => {
              return kb.match().should.eventually.eql(triples)
            })
        }).should.notify(done)
    })

    // it('matches on subject', () => {
    //   let kb = new IndexedFormula()
    //   kb.addAll([ triple1, triple2, triple3, triple4 ])
    //   let s = NamedNode.fromValue('https://example.com/subject1')
    //   let matches = kb.match(s)
    //   expect(matches.length).to.equal(2)
    //   matches.sort()
    //   expect(matches[0].subject).to.eql(s1)
    //   expect(matches[1].subject).to.eql(s1)
    // })

    // it('matches on predicate', () => {
    //   let kb = new IndexedFormula()
    //   kb.addAll([ triple1, triple2, triple3, triple4 ])
    //   let p = NamedNode.fromValue('https://example.com/predicate2')
    //   let matches = kb.match(null, p)
    //   expect(matches.length).to.equal(2)
    //   matches.sort()
    //   expect(matches[0].predicate).to.eql(p2)
    //   expect(matches[1].predicate).to.eql(p2)
    // })

    // it('matches on subject and object', () => {
    //   let kb = new IndexedFormula()
    //   kb.addAll([ triple1, triple2, triple3, triple4 ])
    //   let matches = kb.match(
    //     NamedNode.fromValue('https://example.com/subject1'),
    //     null,
    //     NamedNode.fromValue('https://example.com/object1')
    //   )
    //   console.log(matches)
    //   expect(matches.length).to.equal(1)
    //   expect(matches[0].subject).to.eql(s1)
    //   expect(matches[0].object).to.eql(o1)
    // })
  })
})
