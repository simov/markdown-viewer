
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

    update: (origin) => (e) => {
      state.origins[origin] = e.target.value
      clearTimeout(state.timeout)
      state.timeout = setTimeout(() => {
        chrome.runtime.sendMessage({
          message: 'origin.update', origin, match: e.target.value
        })
      }, 750)
    },

    refresh: (origin) => () => {
      chrome.permissions.request({origins: [origin + '/*']})
    },
  },
}

chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
  state.file = /Firefox/.test(navigator.userAgent)
    ? true // Allow access to file URLs options isn't working on FF
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
      m('.bs-callout m-file',
        m('h4.mdc-typography--headline', 'Access to file:// URLs is Disabled'),
        m('img.mdc-elevation--z2', {src: '/images/file-urls.png'}),
        m('button.mdc-button mdc-button--raised m-button', {
          oncreate: oncreate.ripple,
          onclick: events.file
          },
          'Enable Access to file:// URLs'
        )
      ),

      // allowed origins
      m('.bs-callout m-origins',
        m('h4.mdc-typography--headline', 'Allowed Origins'),

        // add origin
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
        m('.mdc-textfield m-textfield',
          m('input.mdc-textfield__input', {
            type: 'text',
            value: state.origin,
            onchange: events.origin.name,
            placeholder: 'raw.githubusercontent.com'
          })
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
        ),

        // header detection
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
                  onkeyup: events.origin.update(origin),
                  value: state.origins[origin],
                })
              ),
              (origin !== 'file://' || null) &&
              m('span',
                m('button.mdc-button', {
                  oncreate: oncreate.ripple,
                  onclick: events.origin.refresh(origin),
                  title: 'Refresh'
                  },
                  m('i.material-icons icon-refresh')
                ),
                m('button.mdc-button', {
                  oncreate: oncreate.ripple,
                  onclick: events.origin.remove(origin),
                  title: 'Remove'
                  },
                  m('i.material-icons icon-remove')
                )
              )
            )
          )
        )
      ),
    )
})
