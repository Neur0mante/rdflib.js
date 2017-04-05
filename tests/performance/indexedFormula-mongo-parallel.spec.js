/* eslint-env mocha */
import IndexedFormulaMongo from '../../src/indexed-formula-open-session-mongo'
import IndexedFormula from '../../src/indexed-formula'
import Fetcher from '../../src/fetcher-promise'
import NamedNode from '../../src/named-node'
// import Promise from 'bluebird'
import Literal from '../../src/literal'
/* eslint-env mocha */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()
describe('Loading on mongo', () => {
  it('Fetching and loading will take ', (done) => {
    let operationalKB = new IndexedFormula()
    let mongokb = new IndexedFormulaMongo()
    let fetcher = new Fetcher(operationalKB, mongokb, 20000)
    mongokb.clearFormula()
      .then(() => {
        return fetcher.load('file://D:/programming/Q2005.ttl')
      })
      .then(() => {
        done()
        describe('parallel queue in mongo', () => {
          it('parallel mongo queue will take', (donz) => {
            let n
            let queues = []
            let p = new NamedNode('http://schema.org/description')
            n = new Literal('grafický symbol spojovaný s identitou organizace', 'cs')
            queues.push(mongokb.match(null, p, n))
            n = new Literal('grafički znak ili simbol koji najčešće koriste komercijalna poduzeća, organizacije', 'hr')
            queues.push(mongokb.match(null, p, n))
            n = new Literal("scritta o simbolo che rappresenta un prodotto, un servizio, un'azienda o un'organizzazione", 'it')
            queues.push(mongokb.match(null, p, n))
            n = new Literal('marca o emblema gràfic usat normalment per empreses comercials i organitzacions', 'ca')
            queues.push(mongokb.match(null, p, n))
            n = new Literal('marca ou emblema gráfico usado geralmente por organizações e empresas comerciais', 'pt')
            queues.push(mongokb.match(null, p, n))
            n = new Literal('סמליל של חברה, ארגון', 'he')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企业、组织或产品所使用的标志', 'zh')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企業、組織或產品所使用的標誌', 'zh-hant')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('graafinen merkki tai tunnus, jota kaupalliset yritykset ja järjestöt yleisesti käyttävät', 'fi')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('distintivo gráfico utilizado generalmente por organizaciones y empresas comerciales', 'es')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('afbeelding van een logo van een bedrijf of organisatie', 'nl')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('grapiko a marka wenno kayarigan a kadawyan nga inus-usar babaen dagiti komersial nga empresa, guglo ken dagiti produkto', 'ilo')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企业、组织或产品所使用的标志', 'zh-cn')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('ग्राफ़िक चिह्न या प्रतीक जो सामान्यतः वाणिज्यिक उद्यमो, संगठनो और उत्पादो द्वारा प्रयोग किया जाता है', 'hi')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('σήμα ή σύμβολο που χρησιμοποιείται συνήθως από εμπορικές επιχειρήσεις, οργανισμούς και προϊόντα', 'el')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('marque graphique ou emblème communément utilisé par les entreprises commerciales et les organisations', 'fr')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('民間企業や組織で使用されるグラフィック・マークまたは標章', 'ja')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企業、組織或產品所使用的標誌', 'zh-tw')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('Distintivu gráficu específicu que representa a una organización, empresa o productu', 'ast')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('grafisch gestaltetes Wortzeichen', 'de')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企業、組織或產品所使用的標誌', 'zh-hk')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('graphic mark or emblem commonly used by commercial enterprises, organisations and products', 'en-ca')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('વ્યવસાયિક ઉદ્યોગ, સંગઠન અને ઉત્પાદ દ્વારા સામાન્ય રીતે વપરાતું ચિત્ર અથવા મુદ્રા', 'gu')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('grafisk mærke eller emblem, som generelt anvendes af virksomheder og organisationer', 'da')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('графічны сымбаль ці эмблема арганізацыі, прадпрыемства, установы, клюбу і да т. п.', 'be-tarask')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('grafisk märke eller emblem vanligen använt för företag, organisationer eller produkter', 'sv')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('grafika marko aŭ emblemo uzata de enterpreno, organizo aŭ produkto', 'eo')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('marca gràfica o emblema adupiratu da mprisi cummirciali o organizzazzioni', 'scn')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('ôfbylding fan in logo fan in bedriuw of organisaasje', 'fy')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('enpresa, erakunde edota produktu baten ikur grafikoa', 'eu')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('เครื่องหมายสัญลักษณ์ของกิจการ องค์กร และผลิตภัณฑ์', 'th')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('कुनै पनि संस्थाको परिचयात्मक चित्र', 'ne')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('항목 주제의 회사, 단체, 제품에 쓰인 그림 표식이나 그림 문장', 'ko')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('علامة أو شارة مستخدمة عادة من قبل المؤسسات التجارية والمنظمات وإلخ', 'ar')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('grafiskt merki ið vanliga verður nýtt av fyritøkum, feløgum og vørum', 'fo')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('bildefil med grafisk emblem for en bedrift, en organisasjon, et produkt eller lignende', 'nb')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('graficzny znak lub symbol używany do identyfikacji przedsiębiorstw, organizacji lub produktów', 'pl')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企業、組織或產品所使用的標誌', 'zh-mo')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企业、组织或产品所使用的标志', 'zh-my')
            queues.push(mongokb.match(null, p, n))

            n = new Literal('企业、组织或产品所使用的标志', 'zh-sg')
            queues.push(mongokb.match(null, p, n))

            // n = NamedNode.fromValue('http://www.wikidata.org/entity/P287')
            // mongokb.match(n, null, null)
            // console.log('1')
            // Promise.delay(500).then(() => {
            //   console.log('2')
            //   donz()
            // })
            Promise.all(queues)
            .then((res) => {
              res.should.be.an('array')
              // res.map((st) => { console.log(st.toString()) })
              return mongokb.closeDB()
            }).catch().should.notify(donz)
          })
        })
      })
  })
})
