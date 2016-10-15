
var state = {
  origins: []
}

var events = {
  add: () => {
    chrome.permissions.request({
      origins: [document.querySelector('input').value]
    }, (granted) => {
      if (granted) {
        all()
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

function all () {
  chrome.permissions.getAll((res) => {
    state.origins = res.origins
    m.redraw()
  })
}

m.mount(document.querySelector('body'), {
  oninit: () => {
    all()
  },
  view: () =>
    m('div', [
      m('h1', 'Permissions'),
      m('p', 'Read and change your data on:'),
      m('table', state.origins.map((origin) =>
        m('tr', [
          m('td', origin),
          m('td', m('button', {onclick: events.remove(origin)}, 'Remove'))
        ])
      )),
      m('form', [
        m('label', 'Origin'),
        m('input[placeholder="https://raw.githubusercontent.com"]'),
        m('button[type=button]', {onclick: events.add}, 'Add')
      ])
    ])
})
