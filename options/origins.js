
var Origins = () => {
  var defaults = {
    // storage
    origins: {},
    match: '',
    // UI
    host: '',
    timeout: null,
    file: true,
    // chrome
    permissions: {},
  }

  var state = Object.assign({}, defaults)

  chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
    state.file = /Firefox/.test(navigator.userAgent)
      ? true // ff: `Allow access to file URLs` option isn't available
      : isAllowedAccess
    m.redraw()
  })

  chrome.runtime.sendMessage({message: 'options.origins'}, (res) => {
    Object.assign(state, {file: state.file}, res)
    chrome.permissions.getAll(({origins}) => {
      state.permissions = origins.reduce((all, origin) =>
        (all[origin.replace(/(.*)\/\*$/, '$1')] = true, all), {})
      m.redraw()
    })
  })

  var events = {
    file: () => {
      chrome.tabs.create({url: `chrome://extensions/?id=${chrome.runtime.id}`})
    },

    host: (e) => {
      state.scheme = e.target.value.replace(/(.*):\/\/.*/i, '$1')
      state.domain = e.target.value.replace(/.*:\/\/([^:/]+).*/i, '$1')
      state.host = e.target.value
    },

    add: (all) => () => {
      if (!all && !state.host && !['https', 'http', '*'].includes(state.scheme)) {
        return
      }
      var origin = all ? '*://*' : `${state.scheme}://${state.domain}`
      chrome.permissions.request({origins: [`${origin}/*`]}, (granted) => {
        if (granted) {
          chrome.runtime.sendMessage({message: 'origin.add', origin})
          state.origins[origin] = {
            header: true,
            path: true,
            match: state.match,
          }
          state.host = ''
          state.permissions[origin] = true
          m.redraw()
        }
      })
    },

    remove: (origin) => () => {
      chrome.permissions.remove({origins: [`${origin}/*`]}, (removed) => {
        if (removed) {
          chrome.runtime.sendMessage({message: 'origin.remove', origin})
          delete state.origins[origin]
          delete state.permissions[origin]
          m.redraw()
        }
      })
    },

    refresh: (origin) => () => {
      chrome.permissions.request({origins: [`${origin}/*`]}, (granted) => {
        if (granted) {
          state.permissions[origin] = true
          m.redraw()
        }
      })
    },

    header: (origin) => () => {
      state.origins[origin].header = !state.origins[origin].header
      var {header, path, match} = state.origins[origin]
      chrome.runtime.sendMessage({
        message: 'origin.update',
        origin,
        options: {header, path, match},
      })
    },

    path: (origin) => () => {
      state.origins[origin].path = !state.origins[origin].path
      var {header, path, match} = state.origins[origin]
      chrome.runtime.sendMessage({
        message: 'origin.update',
        origin,
        options: {header, path, match},
      })
    },

    match: (origin) => (e) => {
      state.origins[origin].match = e.target.value
      clearTimeout(state.timeout)
      state.timeout = setTimeout(() => {
        var {header, path, match} = state.origins[origin]
        chrome.runtime.sendMessage({
          message: 'origin.update',
          origin,
          options: {header, path, match},
        })
      }, 750)
    },
  }

  var oncreate = {
    ripple: (vnode) => {
      mdc.ripple.MDCRipple.attachTo(vnode.dom)
    },
    textfield: (vnode) => {
      mdc.textfield.MDCTextField.attachTo(vnode.dom)
    }
  }

  var onupdate = {
    header: (origin) => (vnode) => {
      if (vnode.dom.classList.contains('is-checked') !== state.origins[origin].header) {
        vnode.dom.classList.toggle('is-checked')
      }
    },
    path: (origin) => (vnode) => {
      if (vnode.dom.classList.contains('is-checked') !== state.origins[origin].path) {
        vnode.dom.classList.toggle('is-checked')
      }
    }
  }

  var render = () =>
    m('.m-origins',

      // file access
      m('.row',
        m('.col-xxl-10.col-xl-10.col-lg-9.col-md-8.col-sm-12',
          m('h3', 'File Access'),
        ),
        m('.col-xxl-2.col-xl-2.col-lg-3.col-md-4.col-sm-12',
          // file access is disabled
          (!state.file || null) &&
          m('button.mdc-button mdc-button--raised m-button m-btn-file', {
            oncreate: oncreate.ripple,
            onclick: events.file
            },
            'Allow Access'
          )
        ),
      ),
      ...Object.keys(state.origins)
        .filter((origin) => origin === 'file://' && state.file)
        .map(callout),

      // site access
      m('.row',
        m('.col-xxl-10.col-xl-10.col-lg-10.col-md-9.col-sm-8',
          m('h3', 'Site Access'),
        ),
        (!Object.keys(state.origins).includes('*://*') || null) &&
        m('.col-xxl-2.col-xl-2.col-lg-2.col-md-3.col-sm-4',
          m('button.mdc-button mdc-button--raised m-button m-btn-all', {
            oncreate: oncreate.ripple,
            onclick: events.add(true)
            },
            'Allow All'
          ),
        ),
      ),

      // add origin
      m('.bs-callout m-box-add',
        m('.row',
          m('.col-xxl-11.col-xl-11.col-lg-10.col-md-10.col-sm-12',
            m('.mdc-text-field m-textfield', {
              oncreate: oncreate.textfield,
              },
              m('input.mdc-text-field__input', {
                type: 'text',
                value: state.host,
                onchange: events.host,
                placeholder: 'Copy/paste URL address here'
              }),
              m('.mdc-line-ripple')
            ),
          ),
          m('.col-xxl-1.col-xl-1.col-lg-2.col-md-2.col-sm-12',
            m('button.mdc-button mdc-button--raised m-button m-btn-add', {
              oncreate: oncreate.ripple,
              onclick: events.add()
              },
              'Add'
            ),
          )
        )
      ),

      // allowed origins
      ...Object.keys(state.origins)
        .filter((origin) => origin !== 'file://')
        .sort((a, b) => a < b ? 1 : a > b ? -1 : 0)
        .map(callout)
    )

  var callout = (origin) =>
    m('.bs-callout', {class: !state.permissions[origin] ? 'm-box-refresh' : undefined},
      // origin
      m('.row',
        m('.col-xxl-8.col-xl-8.col-lg-8.col-md-7.col-sm-12', m('span.m-origin', origin)),
        m('.col-xxl-4.col-xl-4.col-lg-4.col-md-5.col-sm-12',
          // remove
          (origin !== 'file://' || null) &&
          m('button.mdc-button mdc-button--raised m-button m-btn-remove', {
            oncreate: oncreate.ripple,
            onclick: events.remove(origin)
            },
            'Remove'
          ),
          // refresh
          (!state.permissions[origin] || null) &&
          m('button.mdc-button mdc-button--raised m-button m-btn-refresh', {
            oncreate: oncreate.ripple,
            onclick: events.refresh(origin)
            },
            'Refresh'
          )
        )
      ),
      // header detection
      m('.row',
        m('.col-sm-12',
          m('.overflow',
            m('label.mdc-switch m-switch', {
              onupdate: onupdate.header,
              title: 'Toggle Header Detection'
              },
              m('input.mdc-switch__native-control', {
                type: 'checkbox',
                checked: state.origins[origin].header,
                onchange: events.header(origin)
              }),
              m('.mdc-switch__background', m('.mdc-switch__knob')),
              m('span.mdc-switch-label',
                'Content Type Detection: ',
                m('span', 'text/markdown'),
                ', ',
                m('span', 'text/x-markdown'),
                ', ',
                m('span', 'text/plain'),
              )
            ),
          )
        )
      ),
      // path matching regexp
      m('.row',
        m('.col-sm-12',
          m('.overflow',
            m('label.mdc-switch m-switch', {
              onupdate: onupdate.path,
              title: 'Toggle Path Detection'
              },
              m('input.mdc-switch__native-control', {
                type: 'checkbox',
                checked: state.origins[origin].path,
                onchange: events.path(origin)
              }),
              m('.mdc-switch__background', m('.mdc-switch__knob')),
              m('span.mdc-switch-label',
                'Path Matching RegExp: '
              )
            ),
            m('.mdc-text-field m-textfield', {
              oncreate: oncreate.textfield
              },
              m('input.mdc-text-field__input', {
                type: 'text',
                onkeyup: events.match(origin),
                value: state.origins[origin].match,
              }),
              m('.mdc-line-ripple')
            )
          )
        )
      )
    )

  return {state, render}
}
