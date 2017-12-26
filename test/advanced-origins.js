
var t = require('assert')


module.exports = ({browser, advanced}) => {

  describe('add origin', () => {
    before(async () => {
      // add
      await advanced.select('.m-select', 'http')
      await advanced.type('[type=text]', 'localhost:3000')
      await advanced.click('button')
      await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)
    })

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
          document.querySelector('.m-list li:nth-of-type(2) span:nth-of-type(1)').innerText
        ),
        'http',
        'protocol should be http'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) span:nth-of-type(2)').innerText
        ),
        'localhost:3000',
        'hostname should be localhost:3000'
      )
    })
  })

  describe('disabled header detection + disabled path matching', () => {
    var content

    before(async () => {
      // add origin
      await advanced.select('.m-select', 'http')
      await advanced.type('[type=text]', 'localhost:3000')
      await advanced.click('button')
      await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)

      // disable header detection
      if (await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input').value = ''
        document.querySelector('.m-list li:nth-of-type(2) input')
          .dispatchEvent(new Event('keyup', {bubbles: true}))
      })

      // go to page serving markdown as text/markdown
      content = await browser.newPage()
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor('pre')
    })

    it('text/markdown', async () => {
      t.equal(
        await content.evaluate(() =>
          document.querySelector('pre').innerText
        ),
        '**bold**',
        'markdown should not be rendered'
      )
    })

    after(async () => {
      await content.close()
    })
  })

  describe('enabled header detection + disabled path matching', () => {
    var content

    before(async () => {
      // add origin
      await advanced.bringToFront()
      await advanced.select('.m-select', 'http')
      await advanced.type('[type=text]', 'localhost:3000')
      await advanced.click('button')
      await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // disable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input').value = ''
        document.querySelector('.m-list li:nth-of-type(2) input')
          .dispatchEvent(new Event('keyup', {bubbles: true}))
      })

      // open up new page
      content = await browser.newPage()
      await content.bringToFront()
    })

    it('text/markdown', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/correct-content-type')
      await content.waitFor('#_html')
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
      await content.waitFor('#_html')
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p strong').innerText
        ),
        'bold',
        'markdown should be rendered'
      )
    })

    after(async () => {
      await content.close()
    })
  })

  describe('enabled header detection + enabled path matching', () => {
    var content

    before(async () => {
      // add origin
      await advanced.select('.m-select', 'http')
      await advanced.type('[type=text]', 'localhost:3000')
      await advanced.click('button')
      await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // enable path matching
      await advanced.evaluate(() => {
        document.querySelector('.m-list li:nth-of-type(2) input').value = 'wrong-content-type'
        document.querySelector('.m-list li:nth-of-type(2) input')
          .dispatchEvent(new Event('keyup', {bubbles: true}))
      })
      // TODO: figure out why is this needed
      await advanced.waitFor(600)

      // open up new page
      content = await browser.newPage()
      await content.bringToFront()
    })

    it('text/plain', async () => {
      // go to page serving markdown as text/plain
      await content.goto('http://localhost:3000/wrong-content-type')
      await content.waitFor('#_html')
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p strong').innerText
        ),
        'bold',
        'markdown should be rendered'
      )
    })

    after(async () => {
      await content.close()
    })
  })

}
