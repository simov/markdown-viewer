
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

function get () {
  chrome.runtime.sendMessage({message: 'origins'}, (res) => {
    state.origins = res.origins
    state.header = res.header
    m.redraw()
  })
}

get()

function oncreate (vnode) {
  componentHandler.upgradeElements(vnode.dom)
}
function onupdate (vnode) {
  if (vnode.dom.classList.contains('is-checked') !== state.header) {
    vnode.dom.classList.toggle('is-checked')
  }
}

m.mount(document.querySelector('main'), {
  view: () =>
    m('.mdl-grid',
      (!state.file || null) &&
      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop',
        m('.bs-callout',
          m('h4', 'Access to file:// URLs is Disabled'),
          m('img.mdl-shadow--2dp', {src: '/images/file-urls.png'}),
          m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
            {oncreate, onclick: events.file},
            'Enable Access to file:// URLs'
          )
        )
      ),

      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop',
        m('.bs-callout',
          m('h4', 'Add New Origin'),
          m('select.mdl-shadow--2dp', {onchange: events.protocol},
            state.protocols.map((protocol) =>
            m('option', {value: protocol}, protocol + '://')
          )),
          m('.mdl-textfield mdl-js-textfield', {oncreate},
            m('input.mdl-textfield__input', {
              value: state.origin,
              onchange: events.origin,
              placeholder: 'raw.githubusercontent.com'
            }),
            m('label.mdl-textfield__label')
          ),
          m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
            {oncreate, onclick: events.add},
            'Add'),
          m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
            {oncreate, onclick: events.all},
            'Allow All')
        )
      ),

      m('.mdl-cell mdl-cell--8-col-tablet mdl-cell--12-col-desktop',
        m('.bs-callout',
          m('h4', 'Allowed Origins'),
          m('label.mdl-switch mdl-js-switch mdl-js-ripple-effect',
            {oncreate, onupdate,
            title: 'Toggle header detection'},
            m('input[type="checkbox"].mdl-switch__input', {
              checked: state.header,
              onchange: events.header
            }),
            m('span.mdl-switch__label', 'Detect ',
              m('code', 'text/markdown'), ' and ', m('code', 'text/x-markdown'),
              ' content type')
          ),
          m('table.mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp',
            Object.keys(state.origins).sort().map((origin) =>
            m('tr',
              m('td.mdl-data-table__cell--non-numeric',
                origin.replace(/^(\*|file|http(s)?).*/, '$1')),
              m('td.mdl-data-table__cell--non-numeric',
                origin.replace(/^(\*|file|http(s)?):\/\//, '')),
              m('td.mdl-data-table__cell--non-numeric',
                m('.mdl-textfield mdl-js-textfield', {oncreate},
                  m('input.mdl-textfield__input',
                    {onkeyup: events.update(origin), value: state.origins[origin]}),
                  m('label.mdl-textfield__label')
                )
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
            )
          ))
        )
      )
    )
})
