
var t = require('assert')


module.exports = ({browser, extensions, popup, advanced, content}) => {

  before(async () => {
    // add origin
    await advanced.bringToFront()
    await advanced.select('.m-select', 'http')
    await advanced.type('[type=text]', 'localhost:3000')
    await advanced.click('button')
    await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)

    // disable csp
    if (await advanced.evaluate(() => state.csp)) {
      await advanced.click('.m-switch:nth-of-type(2)')
    }

    // enable path matching
    await advanced.evaluate(() => {
      document.querySelector('.m-list li:nth-of-type(2) input')
        .value = 'csp'
      document.querySelector('.m-list li:nth-of-type(2) input')
        .dispatchEvent(new Event('keyup'))
    })
    // there is debounce timeout of 750ms in the options UI
    await advanced.waitFor(800)
  })

  describe('preserve state', () => {
    it('options page', async () => {
      await advanced.bringToFront()

      // enable csp
      if (!await advanced.evaluate(() => state.csp)) {
        await advanced.click('.m-switch:nth-of-type(2)')
      }
      await advanced.reload()
      await advanced.waitFor('#options')
      await advanced.waitFor(100)

      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-switch:nth-of-type(2)')
            .classList.contains('is-checked')
        ),
        true,
        'csp checkbox should be enabled'
      )

      // disable csp
      if (await advanced.evaluate(() => state.csp)) {
        await advanced.click('.m-switch:nth-of-type(2)')
      }
      await advanced.reload()
      await advanced.waitFor('#options')
      await advanced.waitFor(100)

      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-switch:nth-of-type(2)')
            .classList.contains('is-checked')
        ),
        false,
        'csp checkbox should be disabled'
      )
    })
  })

  describe('enable csp', () => {
    it('webRequest.onHeadersReceived event is enabled', async () => {
      await advanced.bringToFront()
      // enable csp
      if (!await advanced.evaluate(() => state.csp)) {
        await advanced.click('.m-switch:nth-of-type(2)')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp')
      await content.bringToFront()
      await content.waitFor('#_html')

      t.strictEqual(
        await content.evaluate(() =>
          window.localStorage.toString()
        ),
        '[object Storage]',
        'localStorage should be accessible'
      )
    })
  })

  describe('disable csp', () => {
    it('webRequest.onHeadersReceived event is disabled', async () => {
      await advanced.bringToFront()
      // disable csp
      if (await advanced.evaluate(() => state.csp)) {
        await advanced.click('.m-switch:nth-of-type(2)')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp')
      await content.bringToFront()
      await content.waitFor('#_html')

      t.strictEqual(
        await content.evaluate(() => {
          try {
            window.localStorage
          }
          catch (err) {
            return err.message.split(':')[1].trim()
          }
        }),
        `The document is sandboxed and lacks the 'allow-same-origin' flag.`,
        'localStorage should not be accessible'
      )
    })
  })

  describe('enable csp + suspend the event page', () => {
    it('the tab is reloaded on event page wakeup', async () => {
      await advanced.bringToFront()
      // enable csp
      if (!await advanced.evaluate(() => state.csp)) {
        await advanced.click('.m-switch:nth-of-type(2)')
      }

      await extensions.bringToFront()
      // enable developer mode
      await extensions.click('#dev-toggle label')
      // disable the extension
      await extensions.click('.enable-checkbox label')
      // enable the extension
      await extensions.click('.enable-checkbox label')
      // check
      t.equal(
        await extensions.evaluate(() =>
          document.querySelector('.active-views a').innerText
        ),
        'background page (Inactive)',
        'background page should be disabled'
      )

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp')
      await content.bringToFront()
      await content.waitFor('#_html')

      t.strictEqual(
        await content.evaluate(() =>
          window.localStorage.toString()
        ),
        '[object Storage]',
        'localStorage should be accessible'
      )
    })
  })

}
