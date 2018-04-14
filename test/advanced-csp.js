
var t = require('assert')


module.exports = ({extensions, advanced, content}) => {

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
      await advanced.click('.m-list li:nth-of-type(2) .m-footer .m-button:nth-of-type(2)')
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
        .value = 'csp-match-path'
      document.querySelector('.m-list li:nth-of-type(2) input')
        .dispatchEvent(new Event('keyup'))
    })
    // there is debounce timeout of 750ms in the options UI
    await advanced.waitFor(800)
  })

  describe('preserve state', () => {
    it('enable csp', async () => {
      await advanced.bringToFront()

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }
      await advanced.reload()
      await advanced.waitFor(200)

      // expand origin
      await advanced.click('.m-list li:nth-of-type(2)')

      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-switch')
            .classList.contains('is-checked')
        ),
        true,
        'csp checkbox should be enabled'
      )
    })
    it('disable csp', async () => {
      await advanced.bringToFront()

      // disable csp
      if (await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }
      await advanced.reload()
      await advanced.waitFor(200)

      // expand origin
      await advanced.click('.m-list li:nth-of-type(2)')

      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-switch')
            .classList.contains('is-checked')
        ),
        false,
        'csp checkbox should be disabled'
      )
    })
  })

  describe('strip csp header only on matching content type or url', () => {
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-wrong-path')
      await content.bringToFront()
      await content.waitFor(200)
    })
    it('non matching urls should be skipped', async () => {
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

  describe('enable csp', () => {
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()
      await content.waitFor(200)
    })
    it('webRequest.onHeadersReceived event is enabled', async () => {
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
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // disable csp
      if (await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()
      await content.waitFor(200)
    })
    it('webRequest.onHeadersReceived event is disabled', async () => {
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
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

      // chrome://extensions
      await extensions.bringToFront()

      // enable developer mode
      await extensions.evaluate(() => {
        Array.from(
          document.querySelector('extensions-manager').shadowRoot
            .querySelector('extensions-item-list').shadowRoot
            .querySelectorAll('extensions-item'))[0].shadowRoot
            .querySelector('#enable-toggle').click()
      })
      // disable the extension
      await extensions.evaluate(() => {
        Array.from(
          document.querySelector('extensions-manager').shadowRoot
            .querySelector('extensions-item-list').shadowRoot
            .querySelectorAll('extensions-item'))[0].shadowRoot
            .querySelector('#enable-toggle').click()
      })
      await extensions.waitFor(200)
      // check
      t.equal(
        await extensions.evaluate(() =>
          Array.from(
            document.querySelector('extensions-manager').shadowRoot
              .querySelector('extensions-item-list').shadowRoot
              .querySelectorAll('extensions-item'))[0].shadowRoot
              .querySelector('#inspect-views a').innerText
        ),
        'background page (Inactive)',
        'background page should be inactive'
      )

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()
      await content.waitFor(200)
    })
    it('the tab is reloaded on event page wakeup', async () => {
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
