
var t = require('assert')
var defaults = require('./utils/defaults')


module.exports = ({popup, advanced, content}) => {

  before(async () => {
    await defaults({popup, advanced, content})
  })

  describe('correct content-type + disabled header detection + disabled path matching', () => {
    before(async () => {
      await advanced.bringToFront()

      // disable header detection
      if (await advanced.evaluate(() => origins.state.header)) {
        await advanced.click('.m-switch')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(1) input').value = ''
        document.querySelector('.m-list li:nth-of-type(1) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)
    })
    it('text/markdown', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor(300)

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
      if (!await advanced.evaluate(() => origins.state.header)) {
        await advanced.click('.m-switch')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(1) input').value = ''
        document.querySelector('.m-list li:nth-of-type(1) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)
    })
    it('text/markdown', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor(300)

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
      await content.waitFor(300)

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
      if (!await advanced.evaluate(() => origins.state.header)) {
        await advanced.click('.m-switch')
      }

      // enable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(1) input').value = 'wrong-content-type'
        document.querySelector('.m-list li:nth-of-type(1) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)
    })

    it('text/plain', async () => {
      // go to page serving markdown as text/plain
      await content.goto('http://localhost:3000/wrong-content-type')
      await content.bringToFront()
      await content.waitFor(300)

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
