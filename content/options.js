
var state = {
  origins: []
}

var events = {
  add: () => {
    chrome.permissions.request({
      origins: [document.querySelector('input').value]
    }, (granted) => {
      if (granted) {
        get()
        document.querySelector('input').value = ''
      }
    })
  },

  remove: (origin) => () => {
    chrome.permissions.remove({
      origins: [origin]
    }, (removed) => {
      if (removed) {
        var index = state.origins.indexOf(origin)
        state.origins.splice(index, 1)
        m.redraw()
      }
    })
  }
}

function get () {
  chrome.permissions.getAll((res) => {
    state.origins = res.origins
    m.redraw()
  })
}

function oncreate (vnode) {
  componentHandler.upgradeElements(vnode.dom)
}

get()

m.mount(document.querySelector('main'), {
  view: () =>
    m('.mdl-grid', [
      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop', [
        m('h4', 'Add New Origin'),
        m('form', [
          m('input[placeholder="https://raw.githubusercontent.com"]'),
          m('button[type=button].mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
            {oncreate, onclick: events.add},
            'Add')
        ])
      ]),
      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop', [
        m('h4', 'Allowed Origins'),
        m('table.mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp',
          state.origins.map((origin) =>
          m('tr', [
            m('td.mdl-data-table__cell--non-numeric', origin),
            m('td.mdl-data-table__cell--non-numeric',
              m('button.mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon',
                {oncreate, onclick: events.remove(origin), title: 'Remove'},
                m('i.material-icons icon-remove')
              )
            )
          ])
        ))
      ])
    ])
})
