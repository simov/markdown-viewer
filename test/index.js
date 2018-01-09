
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
  'advanced-csp', // should be last - destroys popup and advanced
]


describe('markdown-viewer', () => {
  var browser, server

  it('test suite', async () => {
    browser = await puppeteer.launch(options)

    var extensions = await browser.newPage()
    await extensions.goto('chrome://extensions')
    await extensions.waitForSelector('.extension-id')
    var id = await extensions.evaluate(() =>
      document.querySelector('.extension-id').innerText.trim()
    )

    var popup = await browser.newPage()
    await popup.goto(`chrome-extension://${id}/content/popup.html`)

    var advanced = await browser.newPage()
    await advanced.goto(`chrome-extension://${id}/content/options.html`)

    var content = await browser.newPage()

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
        else if (/content-options-toc/.test(req.url)) {
          res.setHeader('Content-Type', 'text/markdown')
          res.end('# h1\n# h2\n# h3')
        }
        else if (/content-options-scroll/.test(req.url)) {
          res.setHeader('Content-Type', 'text/markdown')
          res.end([
            '# h1',
            Array(500).fill('lorem ipsum').join(' '),
            '## h2',
            Array(500).fill('lorem ipsum').join(' '),
            '### h3',
            Array(500).fill('lorem ipsum').join(' '),
          ].join('\n\n'))
        }
        else if (/csp-match-path/.test(req.url)) {
          res.setHeader('Content-Security-Policy',
            `default-src 'none'; style-src 'unsafe-inline'; sandbox`)
          res.end('# h1')
        }
        else if (/csp-wrong-path/.test(req.url)) {
          res.setHeader('Content-Security-Policy',
            `default-src 'none'; style-src 'unsafe-inline'; sandbox`)
          res.end('# h1')
        }
      })
      server.listen(3000, resolve)
    })

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
