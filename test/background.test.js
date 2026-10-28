const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const root = path.join(__dirname, '..')

const firefoxScripts = [
  'vendor/markdown-it.min.js',
  'vendor/marked.min.js',
  'vendor/remark.min.js',
  'background/compilers/markdown-it.js',
  'background/compilers/marked.js',
  'background/compilers/remark.js',
  'background/storage.js',
  'background/webrequest.js',
  'background/detect.js',
  'background/inject.js',
  'background/messages.js',
  'background/mathjax.js',
  'background/xhr.js',
  'background/icon.js',
  'background/index.js',
]

function read (rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function tick () {
  return new Promise((resolve) => setImmediate(resolve))
}

function boot (options) {
  options = options || {}
  var page = Object.assign({
    url: 'file:///tmp/notes.md',
    header: 'text/plain',
    loaded: false,
  }, options.page)
  var calls = {
    executeScript: [],
    insertCSS: [],
    reload: [],
    updated: [],
    contentInjectCount: 0,
  }
  var storageCallbacks = []
  var lastError = null

  var chrome = {
    runtime: {
      getManifest: () => ({
        browser_specific_settings: {gecko: {id: 'markdown-viewer@outofindex.com'}},
      }),
      onMessage: {addListener () {}},
      getURL: (url) => url,
      get lastError () {
        return lastError
      },
    },
    tabs: {
      onUpdated: {
        addListener (fn) {
          calls.updated.push(fn)
        },
      },
      sendMessage (_tabId, message) {
        if (message && message.message === 'ping') {
          if (options.ping === 'resolve') {
            return Promise.resolve({ready: true})
          }
          if (options.ping === 'reject') {
            return Promise.reject(new Error('Could not establish connection'))
          }
          return Promise.resolve({ready: calls.contentInjectCount > 0})
        }
        return Promise.reject(new Error('Could not establish connection'))
      },
      reload (id) {
        calls.reload.push(id)
      },
      query (_query, callback) {
        callback([])
      },
    },
    storage: {
      sync: {
        get (callback) {
          storageCallbacks.push(callback)
        },
        set () {
          return Promise.resolve()
        },
      },
    },
    permissions: {
      getAll (callback) {
        callback({origins: []})
      },
      remove () {},
    },
    scripting: {
      executeScript (details, callback) {
        calls.executeScript.push(details)
        if (details.files && details.files.includes('/content/index.js')) {
          calls.contentInjectCount += 1
        }
        var result = null
        if (details.func && details.args === undefined) {
          result = JSON.stringify({
            url: page.url,
            header: page.header,
            loaded: page.loaded,
          })
        }
        var response = lastError ? undefined : [{result}]
        if (callback) {
          callback(response)
        }
        return Promise.resolve(response)
      },
      insertCSS (details) {
        calls.insertCSS.push(details)
        return Promise.resolve()
      },
    },
    action: {setIcon () {}},
  }

  chrome.runtime.getBrowserInfo = () => Promise.resolve({name: 'Firefox'})
  if (options.webRequest) {
    chrome.webRequest = {
      onCompleted: {addListener () {}, removeListener () {}},
    }
  }

  var context = {
    console,
    chrome,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    URL,
    RegExp,
    Promise,
    Object,
    Array,
    JSON,
    Date,
    Error,
    Math,
    Number,
    String,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    decodeURIComponent,
    encodeURIComponent,
    btoa: (value) => Buffer.from(value, 'binary').toString('base64'),
    atob: (value) => Buffer.from(value, 'base64').toString('binary'),
    fetch: async () => ({text: async () => ''}),
  }
  context.globalThis = context
  context.self = context
  context.window = context
  context.navigator = {userAgent: 'Mozilla Firefox'}
  vm.createContext(context)

  function load (rel) {
    vm.runInContext(read(rel), context, {filename: rel})
  }

  firefoxScripts.forEach(load)

  function hydrate (stored) {
    storageCallbacks.splice(0).forEach((callback) => callback(stored || {}))
  }

  if (options.hydrate !== false) {
    hydrate(options.stored)
  }

  return {
    calls,
    chrome,
    context,
    page,
    hydrate,
    failNextProbe () {
      lastError = {message: 'No document'}
    },
    allowProbe () {
      lastError = null
    },
  }
}

function injectedFiles (calls) {
  return calls.executeScript
    .filter((call) => call.files)
    .flatMap((call) => call.files)
}

async function open (env, info, tab) {
  assert.equal(env.calls.updated.length, 1)
  if (info.status === 'loading') {
    env.calls.contentInjectCount = 0
  }
  env.calls.updated[0](7, info, tab || {id: 7, url: info.url})
  await tick()
  await tick()
}

test('manifest lists every background script', () => {
  var manifest = JSON.parse(read('manifest.json'))
  var scripts = manifest.background.scripts
  firefoxScripts.forEach((file) => {
    assert.ok(scripts.includes('/' + file), file + ' is missing from manifest.json')
  })
  assert.equal(manifest.background.service_worker, undefined)
})

test('background boots and renders a local markdown file', async () => {
  var env = boot()
  await open(env, {status: 'loading'}, {id: 7, url: 'file:///tmp/notes.md'})
  assert.ok(injectedFiles(env.calls).includes('/content/index.js'))
})

test('a fast file load that only reports complete still renders once', async () => {
  var env = boot()
  await open(env, {status: 'complete', url: 'file:///tmp/notes.md'})
  await open(env, {status: 'complete', url: 'file:///tmp/notes.md'})
  var content = env.calls.executeScript.filter((call) => call.files && call.files.includes('/content/index.js'))
  assert.equal(content.length, 1)
})

test('loading without a changeInfo url uses the tab url', async () => {
  var env = boot()
  await open(env, {status: 'loading'}, {id: 7, url: 'file:///home/me/README.md'})
  assert.ok(injectedFiles(env.calls).includes('/content/index.js'))
})

test('a non-markdown file is left alone', async () => {
  var env = boot({ page: {url: 'file:///tmp/picture.png', header: 'image/png'}})
  await open(env, {status: 'loading', url: 'file:///tmp/picture.png'})
  assert.equal(injectedFiles(env.calls).includes('/content/index.js'), false)
})

test('markdown Firefox sniffed as text/html still renders when the path matches', async () => {
  var env = boot({
    page: {url: 'file:///tmp/readme.md', header: 'text/html'},
  })
  await open(env, {status: 'loading', url: 'file:///tmp/readme.md'})
  assert.ok(injectedFiles(env.calls).includes('/content/index.js'))
})

test('an html page is not rendered just because the header is text/html', async () => {
  var env = boot({
    page: {url: 'file:///tmp/index.html', header: 'text/html'},
  })
  await open(env, {status: 'loading', url: 'file:///tmp/index.html'})
  assert.equal(injectedFiles(env.calls).includes('/content/index.js'), false)
})

test('a tab event that arrives before storage is ready still renders', async () => {
  var env = boot({ hydrate: false})
  env.calls.updated[0](7, {status: 'loading', url: 'file:///tmp/notes.md'}, {id: 7})
  await tick()
  assert.equal(injectedFiles(env.calls).includes('/content/index.js'), false)
  env.hydrate()
  await tick()
  await tick()
  assert.ok(injectedFiles(env.calls).includes('/content/index.js'))
})

test('a probe that runs before the document exists is retried', async () => {
  var env = boot()
  env.failNextProbe()
  await open(env, {status: 'loading', url: 'file:///tmp/notes.md'})
  assert.equal(injectedFiles(env.calls).includes('/content/index.js'), false)
  env.allowProbe()
  await open(env, {status: 'complete', url: 'file:///tmp/notes.md'})
  assert.ok(injectedFiles(env.calls).includes('/content/index.js'))
})

test('a blocked file url is reported until a later probe succeeds', async () => {
  var env = boot()
  env.failNextProbe()
  await open(env, {status: 'complete', url: 'file:///tmp/notes.md'})
  assert.equal(env.context.md.needsFileAccess, true)
  env.allowProbe()
  await open(env, {status: 'complete', url: 'file:///tmp/other.md'})
  assert.equal(env.context.md.needsFileAccess, false)
})

function contentInjections (calls) {
  return calls.executeScript.filter((call) => call.files && call.files.includes('/content/index.js'))
}

test('reloading the same file renders the new document', async () => {
  var env = boot()
  await open(env, {status: 'complete', url: 'file:///tmp/notes.md'})
  assert.equal(contentInjections(env.calls).length, 1)

  // The loading event still sees the outgoing viewer.
  env.page.loaded = true
  await open(env, {status: 'loading', url: 'file:///tmp/notes.md'})
  assert.equal(contentInjections(env.calls).length, 1)

  env.page.loaded = false
  await open(env, {status: 'complete', url: 'file:///tmp/notes.md'})
  assert.equal(contentInjections(env.calls).length, 2)
})

test('a reload does not keep the previous content script as already rendered', async () => {
  var env = boot({ ping: 'resolve'})
  await open(env, {status: 'loading', url: 'file:///tmp/notes.md'})
  assert.equal(contentInjections(env.calls).length, 1)
})

test('the first markdown load reloads once when webRequest is already granted', async () => {
  var env = boot({ webRequest: true})
  await open(env, {status: 'loading', url: 'file:///tmp/notes.md'})
  assert.deepEqual(env.calls.reload, [7])
  assert.equal(injectedFiles(env.calls).includes('/content/index.js'), false)
  await open(env, {status: 'loading', url: 'file:///tmp/notes.md'})
  assert.ok(injectedFiles(env.calls).includes('/content/index.js'))
})
