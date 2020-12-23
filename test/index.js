
var path = require('path')
var puppeteer = require('puppeteer')
var Server = require('./utils/server')

var options = {
  headless: false,
  slowMo: 25,
  args: [
    `--disable-extensions-except=${path.resolve(__dirname, '../')}`,
    `--load-extension=${path.resolve(__dirname, '../')}`,
  ],
}

var tests = [
  'defaults-popup',
  'defaults-options',

  'popup-options',

  'origin-add',
  'origin-match',
  'origin-encoding',
  'origin-csp', // should be last - destroys popup and advanced
]


describe('markdown-viewer', () => {
  var browser, server

  it('test suite', async () => {
    browser = await puppeteer.launch(options)

    var extensions = await browser.newPage()
    await extensions.goto('chrome://extensions')
    // enable developer mode
    await extensions.evaluate(() => {
      document.querySelector('extensions-manager').shadowRoot
        .querySelector('extensions-toolbar').shadowRoot
        .querySelector('cr-toggle').click()
    })
    // get extension id
    var id = await extensions.evaluate(() =>
      Array.from(
        document.querySelector('extensions-manager').shadowRoot
          .querySelector('extensions-item-list').shadowRoot
          .querySelectorAll('extensions-item')
      )[0].id
    )

    var popup = await browser.newPage()
    await popup.goto(`chrome-extension://${id}/popup/index.html`)

    var advanced = await browser.newPage()
    await advanced.goto(`chrome-extension://${id}/options/index.html`)

    var content = await browser.newPage()

    var server = await Server()

    tests.forEach((file) => {
      describe(file, () => {
        require(`./${file}.js`)({puppeteer, browser, extensions, popup, advanced, content})
      })
    })

    after(async () => {
      server.close()
      await browser.close()
    })
  })
})
