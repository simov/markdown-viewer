
var Custom = () => {
  var defaults = {
    theme: '',
    color: 'auto',
    _colors: ['auto', 'light', 'dark'],
    error: '',
  }

  var state = Object.assign({}, defaults)

  chrome.runtime.sendMessage({message: 'custom.get'}, (res) => {
    Object.assign(state, res)
    m.redraw()
  })

  var events = {
    file: (e) => {
      document.querySelector('input[type=file]').click()
    },
    theme: (e) => {
      var file = e.target.files[0]
      if (file) {
        var minified
        var reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = (e) => {
          minified = csso.minify(e.target.result).css
          chrome.runtime.sendMessage({
            message: 'custom.set',
            custom: {
              theme: minified,
              color: state.color,
            },
          }, (res) => {
            if (res?.error) {
              state.error = res.error
            }
            else {
              state.theme = minified
              state.error = ''
            }
            m.redraw()
          })
        }
      }
    },
    remove: (e) => {
      state.theme = ''
      state.error = ''
      chrome.runtime.sendMessage({
        message: 'custom.set',
        custom: {
          theme: state.theme,
          color: state.color,
        },
      })
      m.redraw()
    },
    color: (e) => {
      state.color = state._colors[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'custom.set',
        custom: {
          theme: state.theme,
          color: state.color,
        },
      })
    }
  }

  var oncreate = {
    ripple: (vnode) => {
      mdc.ripple.MDCRipple.attachTo(vnode.dom)
    }
  }

  var onupdate = {}

  var render = () => [
    m('.bs-callout m-custom',
      state.error &&
      m('.row',
        m('.col-12',
          m('span.m-label.m-error', state.error)
        )
      ),
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label',
            'Custom Theme'
          )
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('input', {
            type: 'file',
            accept: '.css',
            onchange: events.theme,
            oncancel: events.theme,
          }),
          m('button.mdc-button mdc-button--raised m-button', {
            oncreate: oncreate.ripple,
            onclick: events.file
            },
            !state.theme ? 'Add' : 'Update'
          ),
          state.theme &&
          m('button.mdc-button mdc-button--raised m-button', {
            oncreate: oncreate.ripple,
            onclick: events.remove
            },
            'Remove'
          ),
        ),
      ),
      state.theme &&
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label',
            'Color Scheme'
          )
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.color
            },
            state._colors.map((color) =>
              m('option', {
                selected: state.color === color,
              }, color)
            )
          )
        ),
      ),
    )
  ]

  return {state, render}
}
