
var http = require('http')
var iconv = require('iconv-lite')


module.exports = () => new Promise((resolve, reject) => {
  var autoreload = {index: 0, content: '你好'}
  server = http.createServer()

  server.on('request', (req, res) => {
    // content-type
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
    // popup options
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
    else if (/popup-autoreload/.test(req.url)) {
      if (/preventCache/.test(req.url)) {
        autoreload.index++
      }
      if (autoreload.index === 3) {
        autoreload.content = '你好你好'
      }
      else if (autoreload.index === 5) {
        autoreload.content = '你好你好你好'
      }
      res.setHeader('Content-Type', 'text/markdown')
      res.end(iconv.encode(autoreload.content, 'big5'))
    }
    // csp
    else if (/csp-match-header/.test(req.url)) {
      res.setHeader('Content-Security-Policy',
        `default-src 'none'; style-src 'unsafe-inline'; sandbox`)
      res.setHeader('Content-Type', 'text/markdown')
      res.end('# h1')
    }
    else if (/csp-match-path/.test(req.url)) {
      res.setHeader('Content-Security-Policy',
        `default-src 'none'; style-src 'unsafe-inline'; sandbox`)
      res.end('# h1')
    }
    else if (/csp-no-header-no-path/.test(req.url)) {
      res.setHeader('Content-Security-Policy',
        `default-src 'none'; style-src 'unsafe-inline'; sandbox`)
      res.end('# h1')
    }
    // encoding
    else if (/encoding-no-content-type/.test(req.url)) {
      res.end(iconv.encode('你好', 'big5'))
    }
    else if (/encoding-no-charset/.test(req.url)) {
      res.setHeader('Content-Type', 'text/markdown')
      res.end(iconv.encode('你好', 'big5'))
    }
    else if (/encoding-wrong-charset/.test(req.url)) {
      res.setHeader('Content-Type', 'text/markdown; charset=UTF-8')
      res.end(iconv.encode('здрасти', 'win1251'))
    }
  })

  server.listen(3000, () => resolve(server))
})
