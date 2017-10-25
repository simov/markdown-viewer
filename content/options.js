
var state = {
  protocol: 'https',
  protocols: ['https', 'http', '*'],
  origin: '',
  origins: {},
  header: false,
  timeout: null,
  file: true
}

var events = {
  file: () => {
    chrome.tabs.create({url: 'chrome://extensions/?id=' + chrome.runtime.id})
  },

  protocol: (e) => {
    state.protocol = state.protocols[e.target.selectedIndex]
  },

  origin: (e) => {
    state.origin = e.target.value
  },

  header: (e) => {
    state.header = !state.header
    chrome.runtime.sendMessage({message: 'header', header: state.header})
  },

  add: () => {
    var host = state.origin
      .replace(/^(file|http(s)?):\/\//, '')
      .replace(/\/.*$/, '')

    if (!host) {
      return
    }

    var origin = state.protocol + '://' + host
    chrome.permissions.request({origins: [origin + '/*']}, (granted) => {
      if (granted) {
        chrome.runtime.sendMessage({message: 'add', origin}, (res) => {
          state.origin = ''
          get()
        })
      }
    })
  },

  all: () => {
    var origin = '*://*'
    chrome.permissions.request({origins: [origin + '/*']}, (granted) => {
      if (granted) {
        chrome.runtime.sendMessage({message: 'add', origin}, (res) => {
          state.origin = ''
          get()
        })
      }
    })
  },

  remove: (origin) => () => {
    chrome.permissions.remove({origins: [origin + '/*']}, (removed) => {
      if (removed) {
        chrome.runtime.sendMessage({message: 'remove', origin}, (res) => {
          get()
        })
      }
    })
  },

  update: (origin) => (e) => {
    state.origins[origin] = e.target.value
    clearTimeout(state.timeout)
    state.timeout = setTimeout(() => {
      chrome.runtime.sendMessage({
        message: 'update', origin, match: e.target.value
      }, (res) => {})
    }, 750)
  },

  refresh: (origin) => () => {
    chrome.permissions.request({origins: [origin + '/*']}, (granted) => {})
  }
}

chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
  state.file = isAllowedAccess
  m.redraw()
})

var get = () => {
  chrome.runtime.sendMessage({message: 'origins'}, (res) => {
    state.origins = res.origins
    state.header = res.header
    m.redraw()
  })
}

get()

var oncreate = {
  ripple: (vnode) => {
    mdc.ripple.MDCRipple.attachTo(vnode.dom)
  }
}

var onupdate = {
  switch: (vnode) => {
    if (vnode.dom.classList.contains('is-checked') !== state.header) {
      vnode.dom.classList.toggle('is-checked')
    }
  }
}

m.mount(document.querySelector('main'), {
  view: () =>
    m('#options',

      // file access is disabled
      (!state.file || null) &&
      m('.bs-callout m-file-access',
        m('h4.mdc-typography--headline', 'Access to file:// URLs is Disabled'),
        m('img.mdc-elevation--z2', {src: '/images/file-urls.png'}),
        m('button.mdc-button mdc-button--raised m-button', {
          oncreate: oncreate.ripple,
          onclick: events.file
          },
          'Enable Access to file:// URLs'
        )
      ),

      // add new origin
      m('.bs-callout m-add-new-origin',
        m('h4.mdc-typography--headline', 'Add New Origin'),
        m('select.mdc-elevation--z2 m-select', {
          onchange: events.protocol
          },
          state.protocols.map((protocol) =>
          m('option', {
            value: protocol
            },
            protocol + '://'
          )
        )),
        m('.mdc-textfield m-textfield',
          m('input.mdc-textfield__input', {
            type: 'text',
            value: state.origin,
            onchange: events.origin,
            placeholder: 'raw.githubusercontent.com'
          })
        ),
        m('button.mdc-button mdc-button--raised m-button', {
          oncreate: oncreate.ripple,
          onclick: events.add
          },
          'Add'
        ),
        m('button.mdc-button mdc-button--raised m-button', {
          oncreate: oncreate.ripple,
          onclick: events.all
          },
          'Allow All'
        )
      ),

      // allowed origins
      m('.bs-callout m-allowed-origins',
        m('h4.mdc-typography--headline', 'Allowed Origins'),
        m('label.mdc-switch m-switch', {
          onupdate: onupdate.switch,
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

        m('ul.mdc-elevation--z2 m-list',
          Object.keys(state.origins).sort().map((origin) =>
            m('li',
              m('span', origin.replace(/^(\*|file|http(s)?).*/, '$1')),
              m('span', origin.replace(/^(\*|file|http(s)?):\/\//, '')),
              m('.mdc-textfield m-textfield', {
                oncreate: oncreate.textfield
                },
                m('input.mdc-textfield__input', {
                  type: 'text',
                  onkeyup: events.update(origin),
                  value: state.origins[origin],
                })
              ),
              (origin !== 'file://' || null) &&
              m('span',
                m('button.mdc-button', {
                  oncreate: oncreate.ripple,
                  onclick: events.refresh(origin),
                  title: 'Refresh'
                  },
                  m('i.material-icons icon-refresh')
                ),
                m('button.mdc-button', {
                  oncreate: oncreate.ripple,
                  onclick: events.remove(origin),
                  title: 'Remove'
                  },
                  m('i.material-icons icon-remove')
                )
              )
            )
          )
        )
      )
    )
})
