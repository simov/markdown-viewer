const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

function loadContent (document, messages) {
  var pre = {
    style: {},
    innerText: '# Title\n\nhello',
  }
  var head = {appendChild () {}}
  var body = {classList: {add () {}, remove () {}}}
  document.querySelector = (selector) => {
    if (selector === 'pre') return document.hasPre === false ? null : pre
    if (selector === 'head') return head
    if (selector === 'body') return body
    return null
  }
  document.createElement = () => ({})
  document.readyState = 'complete'

  var mounted = null
  var context = {
    document,
    location: {href: document.href || 'file:///tmp/notes.md'},
    args: {
      theme: 'github',
      raw: false,
      themes: {width: 'auto'},
      content: {
        syntax: false,
        emoji: false,
        mathjax: false,
        mermaid: false,
        plotly: false,
        abc: false,
        vegalite: false,
        graphviz: false,
        wavedrom: false,
        csv: false,
        toc: false,
      },
      compiler: 'markdown-it',
      custom: {theme: '', color: 'auto'},
    icon: 'default',
    markdown: document.markdown || '',
  },
    chrome: {
      runtime: {
        onMessage: {addListener () {}},
        sendMessage (message, callback) {
          messages.push(message)
          if (callback) {
            callback(message.message === 'fetch'
              ? {body: document.fetched}
              : {html: '<h1>Title</h1>'})
          }
        },
        getURL: (url) => url,
      },
    },
    m: {
      mount (_el, component) {
        mounted = component
        component.oninit()
      },
      redraw () {},
    },
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
    console,
  }
  context.window = context
  vm.createContext(context)
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../content/index.js'), 'utf8'),
    context,
    {filename: 'content/index.js'}
  )
  return {mounted, messages}
}

test('markdown passed in from the page world is used when the pre element is hidden from the content script', () => {
  var messages = []
  loadContent({
    contentType: 'text/plain',
    hasPre: false,
    markdown: '# From the page\n\nbody',
  }, messages)
  assert.equal(messages[0].message, 'markdown')
  assert.match(messages[0].markdown, /# From the page/)
})

test('plain text markdown is read from the pre element', () => {
  var messages = []
  loadContent({contentType: 'text/plain', hasPre: true}, messages)
  assert.equal(messages[0].message, 'markdown')
  assert.match(messages[0].markdown, /# Title/)
})

test('html-sniffed markdown is fetched from the original url', () => {
  var messages = []
  loadContent({
    contentType: 'text/html',
    hasPre: false,
    href: 'file:///tmp/readme.md',
    fetched: '<p align="left">badge</p>\n\n# Readme\n',
  }, messages)
  assert.equal(messages[0].message, 'fetch')
  assert.equal(messages[0].url, 'file:///tmp/readme.md')
  assert.equal(messages[1].message, 'markdown')
  assert.match(messages[1].markdown, /# Readme/)
})
