/* eslint-env mocha */
import IndexedFormulaMongo from '../../src/indexed-formula-promisified-with-mongo'
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
        describe('queue in mongo', () => {
          it('mongo queue will take', (donz) => {
            let a = []
            let n
            let p = new NamedNode('http://schema.org/description')
            n = new Literal('grafický symbol spojovaný s identitou organizace', 'cs')
            mongokb.match(null, p, n)
              .then((res) => {
                a.push(res)
                n = new Literal('grafički znak ili simbol koji najčešće koriste komercijalna poduzeća, organizacije', 'hr')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal("scritta o simbolo che rappresenta un prodotto, un servizio, un'azienda o un'organizzazione", 'it')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('marca o emblema gràfic usat normalment per empreses comercials i organitzacions', 'ca')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('marca ou emblema gráfico usado geralmente por organizações e empresas comerciais', 'pt')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('סמליל של חברה, ארגון', 'he')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企业、组织或产品所使用的标志', 'zh')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企業、組織或產品所使用的標誌', 'zh-hant')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('graafinen merkki tai tunnus, jota kaupalliset yritykset ja järjestöt yleisesti käyttävät', 'fi')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('distintivo gráfico utilizado generalmente por organizaciones y empresas comerciales', 'es')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('afbeelding van een logo van een bedrijf of organisatie', 'nl')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('grapiko a marka wenno kayarigan a kadawyan nga inus-usar babaen dagiti komersial nga empresa, guglo ken dagiti produkto', 'ilo')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企业、组织或产品所使用的标志', 'zh-cn')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('ग्राफ़िक चिह्न या प्रतीक जो सामान्यतः वाणिज्यिक उद्यमो, संगठनो और उत्पादो द्वारा प्रयोग किया जाता है', 'hi')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('σήμα ή σύμβολο που χρησιμοποιείται συνήθως από εμπορικές επιχειρήσεις, οργανισμούς και προϊόντα', 'el')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('marque graphique ou emblème communément utilisé par les entreprises commerciales et les organisations', 'fr')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('民間企業や組織で使用されるグラフィック・マークまたは標章', 'ja')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企業、組織或產品所使用的標誌', 'zh-tw')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('Distintivu gráficu específicu que representa a una organización, empresa o productu', 'ast')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('grafisch gestaltetes Wortzeichen', 'de')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企業、組織或產品所使用的標誌', 'zh-hk')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('graphic mark or emblem commonly used by commercial enterprises, organisations and products', 'en-ca')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('વ્યવસાયિક ઉદ્યોગ, સંગઠન અને ઉત્પાદ દ્વારા સામાન્ય રીતે વપરાતું ચિત્ર અથવા મુદ્રા', 'gu')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('grafisk mærke eller emblem, som generelt anvendes af virksomheder og organisationer', 'da')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('графічны сымбаль ці эмблема арганізацыі, прадпрыемства, установы, клюбу і да т. п.', 'be-tarask')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('grafisk märke eller emblem vanligen använt för företag, organisationer eller produkter', 'sv')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('grafika marko aŭ emblemo uzata de enterpreno, organizo aŭ produkto', 'eo')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('marca gràfica o emblema adupiratu da mprisi cummirciali o organizzazzioni', 'scn')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('ôfbylding fan in logo fan in bedriuw of organisaasje', 'fy')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('enpresa, erakunde edota produktu baten ikur grafikoa', 'eu')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('เครื่องหมายสัญลักษณ์ของกิจการ องค์กร และผลิตภัณฑ์', 'th')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('कुनै पनि संस्थाको परिचयात्मक चित्र', 'ne')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('항목 주제의 회사, 단체, 제품에 쓰인 그림 표식이나 그림 문장', 'ko')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('علامة أو شارة مستخدمة عادة من قبل المؤسسات التجارية والمنظمات وإلخ', 'ar')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('grafiskt merki ið vanliga verður nýtt av fyritøkum, feløgum og vørum', 'fo')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('bildefil med grafisk emblem for en bedrift, en organisasjon, et produkt eller lignende', 'nb')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('graficzny znak lub symbol używany do identyfikacji przedsiębiorstw, organizacji lub produktów', 'pl')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企業、組織或產品所使用的標誌', 'zh-mo')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企业、组织或产品所使用的标志', 'zh-my')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                n = new Literal('企业、组织或产品所使用的标志', 'zh-sg')
                mongokb.match(null, p, n)
              }).then((res) => {
                a.push(res)
                let q = new Literal('組織、公司或者產品嘅標誌檔案', 'yue ')
                mongokb.match(null, null, q)
              }).then((res) => {
                a.push(res)
                // n = NamedNode.fromValue('http://www.wikidata.org/entity/P287')
                // mongokb.match(n, null, null)
                a.should.be.an('array')
                // console.log('1')
                // Promise.delay(500).then(() => {
                //   console.log('2')
                //   donz()
                // })
                // return mongokb.closeDB()
              }).catch().should.notify(donz)
          })
        })
      })
  })
})
