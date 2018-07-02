
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
  })

  describe('add origin', () => {
    it('localhost:3000', async () => {
      t.equal(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-list li').length
        ),
        2,
        'allowed origins count should be 2'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-origin').innerText
        ),
        'http://localhost:3000',
        'origin name should be http://localhost:3000'
      )
    })
  })

  describe('disabled header detection + disabled path matching', () => {
    before(async () => {
      await advanced.bringToFront()

      // disable header detection
      if (await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input')
          .value = ''
        document.querySelector('.m-list li:nth-of-type(2) input')
          .dispatchEvent(new Event('keyup'))
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

  describe('enabled header detection + disabled path matching', () => {
    before(async () => {
      await advanced.bringToFront()

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input')
          .value = ''
        document.querySelector('.m-list li:nth-of-type(2) input')
          .dispatchEvent(new Event('keyup'))
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

  describe('enabled header detection + enabled path matching', () => {
    before(async () => {
      await advanced.bringToFront()

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // enable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input')
          .value = 'wrong-content-type'
        document.querySelector('.m-list li:nth-of-type(2) input')
          .dispatchEvent(new Event('keyup'))
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
