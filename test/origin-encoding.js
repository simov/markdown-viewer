
var t = require('assert')


module.exports = ({advanced, content}) => {

  before(async () => {
    await advanced.bringToFront()

    // remove origin
    if (await advanced.evaluate(() => Object.keys(state.origins).length > 1)) {
      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }
      await advanced.click('.m-list li:nth-of-type(2) .m-footer .m-button')
    }

    // add origin
    await advanced.select('.m-select', 'http')
    await advanced.type('[type=text]', 'localhost:3000')
    await advanced.click('button')
    await advanced.waitFor(200)

    // expand origin
    if (!await advanced.evaluate(() =>
      document.querySelector('.m-list li:nth-of-type(2)')
        .classList.contains('m-expanded'))) {
      await advanced.click('.m-list li:nth-of-type(2)')
    }

    // enable path matching
    await advanced.evaluate(() => {
      document.querySelector('.m-list li:nth-of-type(2) input')
        .value = 'windows-1251'
      document.querySelector('.m-list li:nth-of-type(2) input')
        .dispatchEvent(new Event('keyup'))
    })
    // there is debounce timeout of 750ms in the options UI
    await advanced.waitFor(800)
  })

  describe('incorrect encoding', () => {
    before(async () => {
      // go to page serving windows-1251 encoded string
      // with UTF-8 content-type charset
      await content.goto('http://localhost:3000/windows-1251')
      await content.bringToFront()
      await content.waitFor(200)
    })
    it('use encoding set by the server', async () => {
      t.equal(
        await content.evaluate(() => document.charset),
        'UTF-8',
        'chrome should pick the encoding from the content-type charset'
      )
      t.equal(
        await content.evaluate(() => document.querySelector('#_html p').innerText),
        '�������',
        'text should be decoded incorrectly'
      )
    })
  })

  describe('correct encoding', () => {
    before(async () => {
      await advanced.bringToFront()
      // enable csp - required to enable the webRequest permission!
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }
      // set encoding
      await advanced.select('.m-list li:nth-of-type(2) .m-encoding select', 'Windows-1251')

      // go to page serving windows-1251 encoded string
      // with windows-1251 content-type charset
      await content.goto('http://localhost:3000/windows-1251')
      await content.bringToFront()
      await content.waitFor(200)
    })
    it('use encoding set for the origin', async () => {
      t.equal(
        await content.evaluate(() => document.charset),
        'windows-1251',
        'the content-type charset should be overridden'
      )
      t.equal(
        await content.evaluate(() => document.querySelector('#_html p').innerText),
        'здрасти',
        'text should be decoded correctly'
      )
    })
  })

  describe('persist state', () => {
    before(async () => {
      await advanced.bringToFront()
      await advanced.reload()
      await advanced.waitFor(200)
      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }
    })
    it('reload', async () => {
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-encoding select').value
        ),
        'Windows-1251',
        'should persist the selected encoding'
      )
    })
  })

}
