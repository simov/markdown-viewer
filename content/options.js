
m.mount(document.querySelector('body'), {
  controller: function () {
    var ctrl = {
      origins: []
    }
    ctrl.add = () => {
      chrome.permissions.request({
        origins: [document.querySelector('input').value]
      }, (granted) => {
        if (granted) {
          ctrl.all()
          document.querySelector('input').value = ''
        }
      })
    }
    ctrl.remove = (origin) => () => {
      chrome.permissions.remove({
        origins: [origin]
      }, (removed) => {
        if (removed) {
          var index = ctrl.origins.indexOf(origin)
          ctrl.origins.splice(index, 1)
          m.redraw()
        }
      })
    }
    ctrl.all = () => {
      chrome.permissions.getAll((res) => {
        ctrl.origins = res.origins
        m.redraw()
      })
    }
    ctrl.all()
    return ctrl
  },
  view: (ctrl) =>
    m('div', [
      m('h1', 'Permissions'),
      m('p', 'Read and change your data on:'),
      m('table', ctrl.origins.map((origin) =>
        m('tr', [
          m('td', origin),
          m('td', m('button', {onclick: ctrl.remove(origin)}, 'Remove'))
        ])
      )),
      m('form', [
        m('label', 'Origin'),
        m('input[placeholder="https://raw.githubusercontent.com"]'),
        m('button[type=button]', {onclick: ctrl.add}, 'Add')
      ])
    ])
})
