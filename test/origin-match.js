
var t = require('assert')


module.exports = ({popup, advanced, content}) => {

  before(async () => {
    // popup
    await popup.bringToFront()
    // defaults button
    await popup.click('button:nth-of-type(2)')

    // advanced
    await advanced.bringToFront()

    // remove origin
    if (await advanced.evaluate(() => Object.keys(state.origins).length > 1)) {
      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(2)').classList.contains('m-expanded'))) {
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
    if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(2)').classList.contains('m-expanded'))) {
      await advanced.click('.m-list li:nth-of-type(2)')
    }
  })

  describe('correct content-type + disabled header detection + disabled path matching', () => {
    before(async () => {
      await advanced.bringToFront()

      // disable header detection
      if (await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input').value = ''
        document.querySelector('.m-list li:nth-of-type(2) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)
    })
    it('text/markdown', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor(200)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('pre').innerText
        ),
        '**bold**',
        'markdown should not be rendered'
      )
    })
  })

  describe('correct content-type + enabled header detection + disabled path matching', () => {
    before(async () => {
      await advanced.bringToFront()

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input').value = ''
        document.querySelector('.m-list li:nth-of-type(2) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)
    })
    it('text/markdown', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor(200)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p strong').innerText
        ),
        'bold',
        'markdown should be rendered'
      )
    })
    it('text/x-markdown', async () => {
      // go to page serving markdown as text/x-markdown
      await content.goto('http://localhost:3000/correct-content-type-variation')
      await content.bringToFront()
      await content.waitFor(200)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p strong').innerText
        ),
        'bold',
        'markdown should be rendered'
      )
    })
  })

  describe('wrong content-type + enabled header detection + enabled path matching', () => {
    before(async () => {
      await advanced.bringToFront()

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // enable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input').value = 'wrong-content-type'
        document.querySelector('.m-list li:nth-of-type(2) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)
    })

    it('text/plain', async () => {
      // go to page serving markdown as text/plain
      await content.goto('http://localhost:3000/wrong-content-type')
      await content.bringToFront()
      await content.waitFor(200)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p strong').innerText
        ),
        'bold',
        'markdown should be rendered'
      )
    })
  })

}
