/* eslint-env mocha */
import { expect } from 'chai'
import IndexedFormulaOld from '../../lib/indexed-formula-old'
import IndexedFormula from '../../lib/indexed-formula'
import Fetcher from '../../lib/fetcher'
import NamedNode from '../../lib/named-node'

describe.only('Loading on maps', () => {
  let kb
  it('Fetching and loading will take ', (done) => {
    kb = new IndexedFormula()
    let fetcher = new Fetcher(kb, 20000)
    fetcher.load('https://www.wikidata.org/wiki/Special:EntityData/Q2005.ttl')
      .then(() => {
        done()
        describe('queue in maps', () => {
          it('Queue will take', (donz) => {
            let n = NamedNode.fromValue('http://www.wikidata.org/entity/P287')
            let q = kb.match(n, null, null)
            expect(q).to.be.an('array')
            console.log(q[0])
            donz()
          })
        })
      })
  })
})
describe('Loading on arrays', () => {
  it('Fetching and loading will take ', (done) => {
    let kb2 = new IndexedFormulaOld()
    let fetcher2 = new Fetcher(kb2, 30000)
    fetcher2.load('https://www.wikidata.org/wiki/Special:EntityData/Q2005.ttl')
      .then(() => {
        done()
        describe('queue in maps', () => {
          it('Queue will take', (donz) => {
            let n = NamedNode.fromValue('http://www.wikidata.org/entity/P287')
            let q = kb2.match(n, null, null)
            expect(q).to.be.an('array')
            console.log(q[0])
            donz()
          })
        })
      })
  })
})
