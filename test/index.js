
var path = require('path')
var http = require('http')
var puppeteer = require('puppeteer')

var options = {
  headless: false,
  // slowMo: 300,
  args: [
    `--disable-extensions-except=${path.resolve(__dirname, '../')}`,
    `--load-extension=${path.resolve(__dirname, '../')}`,
  ],
}

var tests = [
  'popup-defaults',
  'advanced-defaults',
  'advanced-origins',
  'popup-options',
]


describe('markdown-viewer', () => {
  var browser, server

  it('test suite', async () => {
    browser = await puppeteer.launch(options)

    var page = await browser.newPage()
    await page.goto('chrome://extensions')
    await page.waitForSelector('.extension-id')
    var id = await page.evaluate(() =>
      document.querySelector('.extension-id').innerText.trim()
    )

    var popup = await browser.newPage()
    await popup.goto(`chrome-extension://${id}/content/popup.html`)

    var advanced = await browser.newPage()
    await advanced.goto(`chrome-extension://${id}/content/options.html`)

    await new Promise((resolve, reject) => {
      server = http.createServer()
      server.on('request', (req, res) => {
        if (/wrong-content-type/.test(req.url)) {
          res.setHeader('Content-Type', 'text/plain')
          res.end('**bold**')
        }
        else if (/correct-content-type/.test(req.url)) {
          res.setHeader('Content-Type', 'text/markdown')
          res.end('**bold**')
        }
        else if (/correct-content-type-variation/.test(req.url)) {
          res.setHeader('Content-Type', 'text/x-markdown')
          res.end('**bold**')
        }
        else if (/compiler-options-marked/.test(req.url)) {
          res.setHeader('Content-Type', 'text/x-markdown')
          res.end('~~strikethrough~~')
        }
        else if (/compiler-options-remark/.test(req.url)) {
          res.setHeader('Content-Type', 'text/x-markdown')
          res.end('- [ ] task')
        }
      })
      server.listen(3000, resolve)
    })

    tests.forEach((file) => {
      describe(file, () => {
        require(`./${file}.js`)({puppeteer, browser, popup, advanced})
      })
    })

    after(async () => {
      server.close()
      await browser.close()
    })
  })
})
