
var t = require('assert')
var defaults = require('./utils/defaults')


module.exports = ({extensions, popup, advanced, content}) => {

  before(async () => {
    await defaults({popup, advanced, content})

    await advanced.bringToFront()

    // enable path matching
    await advanced.evaluate(() => {
      document.querySelector('.m-list li:nth-of-type(1) input').value = 'csp-match-path'
      document.querySelector('.m-list li:nth-of-type(1) input').dispatchEvent(new Event('keyup'))
    })
    // there is debounce timeout of 750ms in the options UI
    await advanced.waitForTimeout(800)
  })

  describe('not correct content-type + non matching path', () => {
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(1)')
      }

      // enable csp
      if (!await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-no-header-no-path')
      await content.bringToFront()
      await content.waitForTimeout(300)
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

  describe('correct content-type + non matching path', () => {
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(1)')
      }

      // enable csp
      if (!await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-header')
      await content.bringToFront()
      await content.waitForTimeout(300)
    })
    it('non matching urls cannot be checked for enabled csp', async () => {
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

  // TEST: localStorage is no longer available even with disabled CSP
  describe.skip('not correct content-type + matching path', () => {
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(1)')
      }

      // enable csp
      if (!await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()
      await content.waitForTimeout(300)
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

  // TEST: localStorage is no longer available even with disabled CSP
  describe.skip('disable - enable - disable', () => {
    it('full cycle', async () => {
      // 1. disable
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(1)')
      }

      // disable csp
      if (await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }
      await advanced.waitForTimeout(300)

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()
      await content.waitForTimeout(300)

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

      // 2. enable
      await advanced.bringToFront()

      // enable csp
      if (!await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }
      await advanced.waitForTimeout(300)

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          window.localStorage.toString()
        ),
        '[object Storage]',
        'localStorage should be accessible'
      )

      // 3. disable
      await advanced.bringToFront()

      // disable csp
      if (await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }
      await advanced.waitForTimeout(300)

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()
      await content.waitForTimeout(300)

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

  describe('persist state', () => {
    it('enable csp', async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(1)')
      }

      // enable csp
      if (!await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }
      await advanced.reload()
      await advanced.waitForTimeout(300)

      // expand origin
      await advanced.click('.m-list li:nth-of-type(1)')

      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(1) .m-switch').classList.contains('is-checked')
        ),
        true,
        'csp checkbox should be enabled'
      )
    })
    it('disable csp', async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(1)')
      }

      // disable csp
      if (await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }
      await advanced.reload()
      await advanced.waitForTimeout(300)

      // expand origin
      await advanced.click('.m-list li:nth-of-type(1)')

      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(1) .m-switch').classList.contains('is-checked')
        ),
        false,
        'csp checkbox should be disabled'
      )
    })
  })

  describe('enable csp + suspend the event page', () => {
    before(async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(1)')
      }

      // enable csp
      if (!await advanced.evaluate(() => origins.state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(1) .m-switch')
      }

      // chrome://extensions
      await extensions.bringToFront()

      // enable developer mode
      await extensions.evaluate(() => {
        Array.from(
          document.querySelector('extensions-manager').shadowRoot
            .querySelector('extensions-item-list').shadowRoot
            .querySelectorAll('extensions-item'))[0].shadowRoot
            .querySelector('#enableToggle').click()
      })
      // disable the extension
      await extensions.evaluate(() => {
        Array.from(
          document.querySelector('extensions-manager').shadowRoot
            .querySelector('extensions-item-list').shadowRoot
            .querySelectorAll('extensions-item'))[0].shadowRoot
            .querySelector('#enableToggle').click()
      })
      await extensions.waitForTimeout(300)
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
      await content.waitForTimeout(300)
    })
    // TEST: localStorage is no longer available even with disabled CSP
    it.skip('the tab is reloaded on event page wakeup', async () => {
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
