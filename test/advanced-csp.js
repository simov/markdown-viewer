
var t = require('assert')


module.exports = ({browser, extensions, popup, advanced, content}) => {

  before(async () => {
    // add origin
    await advanced.bringToFront()
    await advanced.select('.m-select', 'http')
    await advanced.type('[type=text]', 'localhost:3000')
    await advanced.click('button')

    // TODO: wait for https://github.com/GoogleChrome/puppeteer/pull/2289
    // await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)
    await advanced.waitFor(200)

    // expand origin
    if (!await advanced.evaluate(() =>
      document.querySelector('.m-list li:nth-of-type(2)')
        .classList.contains('m-exapanded')))
    {
      await advanced.click('.m-list li:nth-of-type(2)')
    }

    // disable csp
    if (await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
      await advanced.click('.m-list li:nth-of-type(2) .m-switch')
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
    it('options page', async () => {
      await advanced.bringToFront()

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }
      await advanced.reload()

      // TODO: wait for https://github.com/GoogleChrome/puppeteer/pull/2289
      // await advanced.waitFor('#options')
      // await advanced.waitFor(100)
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

      // disable csp
      if (await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }
      await advanced.reload()
      // TODO: wait for https://github.com/GoogleChrome/puppeteer/pull/2289
      // await advanced.waitFor('#options')
      // await advanced.waitFor(100)
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
    it('non matching urls should be skipped', async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-exapanded')))
      {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-wrong-path')
      await content.bringToFront()
      // TODO: wait for https://github.com/GoogleChrome/puppeteer/pull/2289
      // await content.waitFor('pre')
      await advanced.waitFor(200)

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
    it('webRequest.onHeadersReceived event is enabled', async () => {
      await advanced.bringToFront()

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-exapanded')))
      {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
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

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-exapanded')))
      {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // disable csp
      if (await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

      // go to page serving content with strict csp
      await content.goto('http://localhost:3000/csp-match-path')
      await content.bringToFront()

      // TODO: wait for https://github.com/GoogleChrome/puppeteer/pull/2289
      // await content.waitFor('#_html')
      await advanced.waitFor(200)

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

      // expand origin
      if (!await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(2)')
          .classList.contains('m-exapanded')))
      {
        await advanced.click('.m-list li:nth-of-type(2)')
      }

      // enable csp
      if (!await advanced.evaluate(() => state.origins['http://localhost:3000'].csp)) {
        await advanced.click('.m-list li:nth-of-type(2) .m-switch')
      }

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

      // TODO: wait for https://github.com/GoogleChrome/puppeteer/pull/2289
      // await content.waitFor('#_html')
      await content.waitFor(200)

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
