
var defaults = {
  // storage
  origins: {},
  header: false,
  // static
  protocols: ['https', 'http', '*'],
  // UI
  protocol: 'https',
  origin: '',
  timeout: null,
  file: true,
  encodings: {
    'Unicode': ['UTF-8', 'UTF-16LE'],
    'Arabic': ['ISO-8859-6', 'Windows-1256'],
    'Baltic': ['ISO-8859-4', 'ISO-8859-13', 'Windows-1257'],
    'Celtic': ['ISO-8859-14'],
    'Central European': ['ISO-8859-2', 'Windows-1250'],
    'Chinese Simplified': ['GB18030', 'GBK'],
    'Chinese Traditional': ['BIG5'],
    'Cyrillic': ['ISO-8859-5', 'IBM866', 'KOI8-R', 'KOI8-U', 'Windows-1251'],
    'Greek': ['ISO-8859-7', 'Windows-1253'],
    'Hebrew': ['Windows-1255', 'ISO-8859-8', 'ISO-8859-8-I'],
    'Japanese': ['EUC-JP', 'ISO-2022-JP', 'Shift_JIS'],
    'Korean': ['EUC-KR'],
    'Nordic': ['ISO-8859-10'],
    'Romanian': ['ISO-8859-16'],
    'South European': ['ISO-8859-3'],
    'Thai': ['Windows-874'],
    'Turkish': ['Windows-1254'],
    'Vietnamese': ['Windows-1258'],
    'Western': ['ISO-8859-15', 'Windows-1252', 'Macintosh'],
  }
}
var state = Object.assign({}, defaults)

var events = {
  file: () => {
    chrome.tabs.create({url: 'chrome://extensions/?id=' + chrome.runtime.id})
  },

  header: (e) => {
    state.header = !state.header
    chrome.runtime.sendMessage({
      message: 'options.header',
      header: state.header,
    })
  },

  origin: {
    protocol: (e) => {
      state.protocol = state.protocols[e.target.selectedIndex]
    },

    name: (e) => {
      state.origin = e.target.value
    },

    add: () => {
      var domain = state.origin.replace(/.*:\/\/([^/]+).*/i, '$1')
      if (!domain) {
        return
      }
      var origin = state.protocol + '://' + domain
      chrome.permissions.request({origins: [origin + '/*']}, (granted) => {
        if (granted) {
          chrome.runtime.sendMessage({message: 'origin.add', origin}, init)
        }
      })
    },

    all: () => {
      var origin = '*://*'
      chrome.permissions.request({origins: [origin + '/*']}, (granted) => {
        if (granted) {
          chrome.runtime.sendMessage({message: 'origin.add', origin}, init)
        }
      })
    },

    remove: (origin) => () => {
      chrome.permissions.remove({origins: [origin + '/*']}, (removed) => {
        if (removed) {
          chrome.runtime.sendMessage({message: 'origin.remove', origin}, init)
        }
      })
    },

    refresh: (origin) => () => {
      chrome.permissions.request({origins: [origin + '/*']})
    },

    match: (origin) => (e) => {
      state.origins[origin].match = e.target.value
      clearTimeout(state.timeout)
      state.timeout = setTimeout(() => {
        var {match, csp, encoding} = state.origins[origin]
        chrome.runtime.sendMessage({
          message: 'origin.update',
          origin,
          options: {match, csp, encoding},
        })
      }, 750)
    },

    csp: (origin) => () => {
      state.origins[origin].csp = !state.origins[origin].csp
      var {match, csp, encoding} = state.origins[origin]
      chrome.runtime.sendMessage({
        message: 'origin.update',
        origin,
        options: {match, csp, encoding},
      })
      webRequest()
    },

    encoding: (origin) => (e) => {
      state.origins[origin].encoding = e.target.value
      var {match, csp, encoding} = state.origins[origin]
      chrome.runtime.sendMessage({
        message: 'origin.update',
        origin,
        options: {match, csp, encoding},
      })
      webRequest()
    },
  },
}

function webRequest () {
  // ff: webRequest is required permission
  if (/Firefox/.test(navigator.userAgent)) {
    return
  }

  var intercept = false
  for (var key in state.origins) {
    if (state.origins[key].csp || state.origins[key].encoding) {
      intercept = true
      break
    }
  }

  chrome.permissions[intercept ? 'request' : 'remove']({
    permissions: ['webRequest', 'webRequestBlocking']
  }, () => {
    chrome.runtime.sendMessage({
      message: 'options.intercept',
      intercept,
    })
  })
}

chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
  state.file = /Firefox/.test(navigator.userAgent)
    ? true // ff: `Allow access to file URLs` option isn't available
    : isAllowedAccess
  m.redraw()
})

var init = () => {
  chrome.runtime.sendMessage({message: 'options'}, (res) => {
    state = Object.assign({}, defaults, {file: state.file}, res)
    m.redraw()
  })
}

init()

var oncreate = {
  ripple: (vnode) => {
    mdc.ripple.MDCRipple.attachTo(vnode.dom)
  },
  textfield: (vnode) => {
    mdc.textfield.MDCTextField.attachTo(vnode.dom)
  }
}

var onupdate = {
  header: (vnode) => {
    if (vnode.dom.classList.contains('is-checked') !== state.header) {
      vnode.dom.classList.toggle('is-checked')
    }
  },
  csp: (origin) => (vnode) => {
    if (vnode.dom.classList.contains('is-checked') !== state.origins[origin].csp) {
      vnode.dom.classList.toggle('is-checked')
    }
  }
}

m.mount(document.querySelector('main'), {
  view: () =>
    m('#options',

      // allowed origins
      m('.bs-callout m-origins',

        // add origin
        m('.m-add-origin',
          m('h4.mdc-typography--headline', 'Allowed Origins'),
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.origin.protocol
            },
            state.protocols.map((protocol) =>
            m('option', {
              value: protocol,
              selected: protocol === state.protocol
              },
              protocol + '://'
            )
          )),
          m('.mdc-text-field m-textfield', {
            oncreate: oncreate.textfield,
            },
            m('input.mdc-text-field__input', {
              type: 'text',
              value: state.origin,
              onchange: events.origin.name,
              placeholder: 'raw.githubusercontent.com'
            }),
            m('.mdc-line-ripple')
          ),
          m('button.mdc-button mdc-button--raised m-button', {
            oncreate: oncreate.ripple,
            onclick: events.origin.add
            },
            'Add'
          ),
          m('button.mdc-button mdc-button--raised m-button', {
            oncreate: oncreate.ripple,
            onclick: events.origin.all
            },
            'Allow All'
          )
        ),

        // global options
        m('.m-global',
          // header detection - ff: disabled
          (!/Firefox/.test(navigator.userAgent) || null) &&
          m('label.mdc-switch m-switch', {
            onupdate: onupdate.header,
            title: 'Toggle header detection'
            },
            m('input.mdc-switch__native-control', {
              type: 'checkbox',
              checked: state.header,
              onchange: events.header
            }),
            m('.mdc-switch__background', m('.mdc-switch__knob')),
            m('span.mdc-switch-label',
              'Detect ',
              m('code', 'text/markdown'),
              ' and ',
              m('code', 'text/x-markdown'),
              ' content type'
            )
          ),

          // file access is disabled
          (!state.file || null) &&
          m('button.mdc-button mdc-button--raised m-button', {
            oncreate: oncreate.ripple,
            onclick: events.file
            },
            'Allow Access to file:// URLs'
          )
        ),

        // allowed origins
        m('ul.m-list',
          Object.keys(state.origins).sort().map((origin) =>
            (
              (
                state.file && origin === 'file://' &&
                // ff: access to file:// URLs is not allowed
                !/Firefox/.test(navigator.userAgent)
              )
              || origin !== 'file://' || null
            ) &&
            m('li.mdc-elevation--z2', {
              class: state.origins[origin].expanded ? 'm-expanded' : null,
              },
              m('.m-summary', {
                onclick: (e) => state.origins[origin].expanded = !state.origins[origin].expanded
                },
                m('.m-origin', origin),
                m('.m-options',
                  state.origins[origin].match !== state.match ? m('span', 'match') : null,
                  state.origins[origin].csp ? m('span', 'csp') : null,
                  state.origins[origin].encoding ? m('span', 'encoding') : null,
                ),
                m('i.material-icons', {
                  class: state.origins[origin].expanded ? 'icon-arrow-up' : 'icon-arrow-down'
                })
              ),
              m('.m-content',
                // match
                m('.m-option m-match',
                  m('.m-name', m('span', 'match')),
                  m('.m-control',
                    m('.mdc-text-field m-textfield', {
                      oncreate: oncreate.textfield
                      },
                      m('input.mdc-text-field__input', {
                        type: 'text',
                        onkeyup: events.origin.match(origin),
                        value: state.origins[origin].match,
                      }),
                      m('.mdc-line-ripple')
                    )
                  )
                ),
                // csp
                (origin !== 'file://' || null) &&
                m('.m-option m-csp',
                  m('.m-name', m('span', 'csp')),
                  m('.m-control',
                    m('label.mdc-switch m-switch', {
                      onupdate: onupdate.csp(origin),
                      },
                      m('input.mdc-switch__native-control', {
                        type: 'checkbox',
                        checked: state.origins[origin].csp,
                        onchange: events.origin.csp(origin)
                      }),
                      m('.mdc-switch__background', m('.mdc-switch__knob')),
                      m('span.mdc-switch-label',
                        'Disable ',
                        m('code', 'Content Security Policy'),
                      )
                    )
                  )
                ),
                // encoding
                (origin !== 'file://' || null) &&
                m('.m-option m-encoding',
                  m('.m-name', m('span', 'encoding')),
                  m('.m-control',
                    m('select.mdc-elevation--z2 m-select', {
                      onchange: events.origin.encoding(origin),
                      },
                      m('option', {
                        value: '',
                        selected: state.origins[origin].encoding === ''
                        },
                        'auto'
                      ),
                      Object.keys(state.encodings).map((label) =>
                        m('optgroup', {label}, state.encodings[label].map((encoding) =>
                          m('option', {
                            value: encoding,
                            selected: state.origins[origin].encoding === encoding
                            },
                            encoding
                          )
                        ))
                      )
                    )
                  )
                ),
                // refresh/remove
                (origin !== 'file://' || null) &&
                m('.m-footer',
                  m('span',
                    m('button.mdc-button mdc-button--raised m-button', {
                      oncreate: oncreate.ripple,
                      onclick: events.origin.refresh(origin)
                      },
                      'Refresh'
                    ),
                    m('button.mdc-button mdc-button--raised m-button', {
                      oncreate: oncreate.ripple,
                      onclick: events.origin.remove(origin)
                      },
                      'Remove'
                    )
                  )
                )
              )
            )
          )
        )
      ),
    )
})

// ff: set appropriate footer icon
document.querySelector(
  '.icon-' + (/Firefox/.test(navigator.userAgent) ? 'firefox' : 'chrome')
).classList.remove('icon-hidden')
