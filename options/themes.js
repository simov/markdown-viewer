
var Themes = () => {
  var defaults = {
    // storage
    themes: [],
    // UI
    timeout: null,
    theme: {},
    // static
  }

  var state = Object.assign({}, defaults)

  chrome.runtime.sendMessage({message: 'options.themes'}, (res) => {
    Object.assign(state, res)
    m.redraw()
  })

  var events = {
    name: (e) => {
      state.theme.name = e.target.value
    },

    url: (e) => {
      state.theme.url = e.target.value
    },

    add: () => {
      if (!state.theme.name || !state.theme.url) {
        return
      }
      var all = chrome.runtime.getManifest().web_accessible_resources
        .filter((file) => file.indexOf('/themes/') === 0)
        .map((file) => file.replace(/\/themes\/(.*)\.css/, '$1'))
        .concat(state.themes.map(({name}) => name))
      if (all.includes(state.theme.name)) {
        return
      }
      state.themes.push({
        name: state.theme.name,
        url: state.theme.url,
      })
      chrome.runtime.sendMessage({
        message: 'themes',
        themes: state.themes.map(({name, url}) => ({name, url}))
      })
      state.theme.name = ''
      state.theme.url = ''
      m.redraw()
    },

    update: {
      name: (theme) => (e) => {
        theme.name = e.target.value
        clearTimeout(state.timeout)
        state.timeout = setTimeout(() => {
          chrome.runtime.sendMessage({
            message: 'themes',
            themes: state.themes.map(({name, url}) => ({name, url}))
          })
          m.redraw()
        }, 750)
      },

      url: (theme) => (e) => {
        theme.url = e.target.value
        clearTimeout(state.timeout)
        state.timeout = setTimeout(() => {
          chrome.runtime.sendMessage({
            message: 'themes',
            themes: state.themes.map(({name, url}) => ({name, url}))
          })
        }, 750)
      }
    },

    remove: (theme) => () => {
      var index = state.themes.findIndex(({name}) => name === theme.name)
      state.themes.splice(index, 1)
      chrome.runtime.sendMessage({
        message: 'themes',
        themes: state.themes.map(({name, url}) => ({name, url}))
      })
      m.redraw()
    }
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
    cache: (theme) => (vnode) => {
      if (vnode.dom.classList.contains('is-checked') !== state.themes[theme.name].cache) {
        vnode.dom.classList.toggle('is-checked')
      }
    }
  }

  var render = () =>
    m('.bs-callout m-themes',

      // add theme
      m('.m-add-theme',
        m('h4.mdc-typography--headline5', 'Custom Themes'),
        // name
        m('.mdc-text-field m-textfield m-name', {
          oncreate: oncreate.textfield,
          },
          m('input.mdc-text-field__input', {
            type: 'text',
            value: state.theme.name,
            onchange: events.name,
            placeholder: 'Name'
          }),
          m('.mdc-line-ripple')
        ),
        // url
        m('.mdc-text-field m-textfield m-url', {
          oncreate: oncreate.textfield,
          },
          m('input.mdc-text-field__input', {
            type: 'text',
            value: state.theme.url,
            onchange: events.url,
            placeholder: 'URL - file:///home.. | http://localhost..'
          }),
          m('.mdc-line-ripple')
        ),
        m('button.mdc-button mdc-button--raised m-button', {
          oncreate: oncreate.ripple,
          onclick: events.add
          },
          'Add'
        )
      ),

      // themes list
      (state.themes.length || null) &&
      m('ul.m-list', state.themes.map((theme) =>
        m('li.mdc-elevation--z2', {
          class: theme.expanded ? 'm-expanded' : null,
          },
          m('.m-summary', {
            onclick: (e) => theme.expanded = !theme.expanded
            },
            m('.m-title', theme.name),
            m('i.material-icons', {
              class: theme.expanded ? 'icon-arrow-up' : 'icon-arrow-down'
            })
          ),
          m('.m-content',
            // name
            m('.m-option m-theme',
              m('.m-name', m('span', 'Name')),
              m('.m-control',
                m('.mdc-text-field m-textfield', {
                  oncreate: oncreate.textfield
                  },
                  m('input.mdc-text-field__input', {
                    type: 'text',
                    onkeyup: events.update.name(theme),
                    value: theme.name,
                  }),
                  m('.mdc-line-ripple')
                )
              )
            ),
            // url
            m('.m-option m-theme',
              m('.m-name', m('span', 'URL')),
              m('.m-control',
                m('.mdc-text-field m-textfield', {
                  oncreate: oncreate.textfield
                  },
                  m('input.mdc-text-field__input', {
                    type: 'text',
                    onkeyup: events.update.url(theme),
                    value: theme.url,
                  }),
                  m('.mdc-line-ripple')
                )
              )
            ),
            // update/remove
            m('.m-footer',
              m('span',
                m('button.mdc-button mdc-button--raised m-button', {
                  oncreate: oncreate.ripple,
                  onclick: events.remove(theme)
                  },
                  'Remove'
                )
              )
            )
          )
        )
      ))
    )

  return {state, render}
}
