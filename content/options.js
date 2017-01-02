
var state = {
  origin: '',
  origins: {},
  timeout: null
}

var events = {
  add: () => {
    if (!state.origin || /^file:/.test(state.origin)) {
      return
    }
    var origin = state.origin.replace(/\/$/, '')
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
  },

  origin: (e) => {
    state.origin = e.target.value
  }
}

function get () {
  chrome.runtime.sendMessage({message: 'origins'}, (res) => {
    state.origins = res.origins
    m.redraw()
  })
}

get()

function oncreate (vnode) {
  componentHandler.upgradeElements(vnode.dom)
}

m.mount(document.querySelector('main'), {
  view: () =>
    m('.mdl-grid', [
      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop', [
        m('h4', 'Add New Origin'),
      ]),
      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop', [
        m('.mdl-textfield mdl-js-textfield', {oncreate}, [
          m('input.mdl-textfield__input', {
            value: state.origin,
            onchange: events.origin,
            placeholder: 'https://raw.githubusercontent.com'
          }),
          m('label.mdl-textfield__label')
        ]),
        m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
          {oncreate, onclick: events.add},
          'Add')
      ]),

      (Object.keys(state.origins).length || null) &&
      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop',
        m('h4', 'Allowed Origins')
      ),
      (Object.keys(state.origins).length || null) &&
      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop',
        m('table.mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp',
          Object.keys(state.origins).sort().map((origin) =>
          m('tr', [
            m('td.mdl-data-table__cell--non-numeric', origin),
            m('td.mdl-data-table__cell--non-numeric',
              m('.mdl-textfield mdl-js-textfield', {oncreate}, [
                m('input.mdl-textfield__input',
                  {onkeyup: events.update(origin), value: state.origins[origin]}),
                m('label.mdl-textfield__label')
              ])
            ),
            m('td',
              (origin !== 'file://' || null) &&
              m('button.mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon',
                {oncreate, onclick: events.refresh(origin), title: 'Refresh'},
                m('i.material-icons icon-refresh')
              ),
              (origin !== 'file://' || null) &&
              m('button.mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon',
                {oncreate, onclick: events.remove(origin), title: 'Remove'},
                m('i.material-icons icon-remove')
              )
            )
          ])
        ))
      )
    ])
})
