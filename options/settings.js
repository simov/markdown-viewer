
var Settings = () => {
  var defaults = {
    icons: false
  }

  var state = Object.assign({}, defaults)

  chrome.runtime.sendMessage({message: 'options.settings'}, (res) => {
    Object.assign(state, res)
    m.redraw()
  })

  var events = {
    icon: () => (e) => {
      state.icon = !state.icon
      chrome.runtime.sendMessage({
        message: 'options.icon',
        icon: state.icon,
      })
    }
  }

  var oncreate = {
    ripple: (vnode) => {
      mdc.ripple.MDCRipple.attachTo(vnode.dom)
    }
  }

  var onupdate = {
    icon: () => (vnode) => {
      if (vnode.dom.classList.contains('is-checked') !== state.icon) {
        vnode.dom.classList.toggle('is-checked')
      }
    }
  }

  var render = () =>
    m('.m-settings hidden',
      m('.row',
        m('h3', 'Settings')
      ),
      m('.bs-callout',
        m('.row',
          m('.col-sm-12',
            m('.overflow',
              m('label.mdc-switch m-switch', {
                onupdate: onupdate.icon(),
                },
                m('input.mdc-switch__native-control', {
                  type: 'checkbox',
                  checked: state.icon,
                  onchange: events.icon()
                }),
                m('.mdc-switch__background', m('.mdc-switch__knob')),
                m('span.mdc-switch-label',
                  'Light Extension Icon for Dark Browser Theme'
                )
              )
            )
          )
        )
      )
    )

  return {state, render}
}
