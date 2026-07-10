
var Custom = () => {
  var defaults = {
    theme: '',
    color: 'auto',
    base: '',
    local: false,
    fallback: false,
    draft: '',
    error: '',
    _colors: ['auto', 'light', 'dark'],
    _storages: ['sync', 'local'],
    _bases: [
      '',
      'github', 'github-dark', 'almond', 'awsm', 'axist', 'bamboo',
      'bullframe', 'holiday', 'kacit', 'latex', 'marx', 'mini', 'modest',
      'new', 'no-class', 'pico', 'retro', 'sakura', 'sakura-vader',
      'semantic', 'simple', 'style-sans', 'style-serif', 'stylize',
      'superstylin', 'tacit', 'vanilla', 'water', 'water-dark', 'writ',
    ],
  }

  var state = Object.assign({}, defaults)

  chrome.runtime.sendMessage({message: 'custom.get'}, (res) => {
    Object.assign(state, res)
    state.draft = state.theme
    m.redraw()
  })

  // sends theme + color + base; the background stores it in sync, or
  // falls back to local storage when it is too large for a sync item
  var save = (theme) => {
    chrome.runtime.sendMessage({
      message: 'custom.set',
      local: state.local,
      custom: {theme: theme, color: state.color, base: state.base},
    }, (res) => {
      if (res?.error) {
        state.error = res.error
      }
      else {
        state.theme = theme
        state.draft = theme
        state.local = !!(res && res.local)
        state.fallback = !!(res && res.fallback)
        state.error = ''
      }
      m.redraw()
    })
  }

  var events = {
    file: (e) => {
      document.querySelector('input[type=file]').click()
    },
    // uploaded files get minified before storing
    upload: (e) => {
      var file = e.target.files[0]
      if (file) {
        var reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = (e) => {
          save(csso.minify(e.target.result).css)
        }
      }
    },
    // typed css is stored as-is so it stays editable
    input: (e) => {
      state.draft = e.target.value
    },
    apply: (e) => {
      save(state.draft)
    },
    remove: (e) => {
      save('')
    },
    base: (e) => {
      state.base = state._bases[e.target.selectedIndex]
      save(state.theme)
    },
    storage: (e) => {
      state.local = state._storages[e.target.selectedIndex] === 'local'
      save(state.theme)
    },
    color: (e) => {
      state.color = state._colors[e.target.selectedIndex]
      save(state.theme)
    },
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

      // base theme to extend (none = full custom theme)
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label', 'Base Theme')
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('select.mdc-elevation--z2 m-select', {onchange: events.base},
            state._bases.map((base) =>
              m('option', {selected: state.base === base}, base || 'none (full custom)')
            )
          )
        ),
      ),

      // css editor (typed css is stored unminified and stays editable)
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label', 'Custom CSS')
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('textarea.mdc-elevation--z2 m-textarea', {
            rows: 8,
            spellcheck: false,
            value: state.draft,
            oninput: events.input,
            style: {
              width: '100%',
              minHeight: '160px',
              fontFamily: 'monospace',
              fontSize: '12px',
              boxSizing: 'border-box',
            },
            placeholder: state.base
              ? '/* overrides for the base theme */'
              : '/* full custom theme css */',
          }),
          m('button.mdc-button mdc-button--raised m-button', {
            oncreate: oncreate.ripple,
            onclick: events.apply,
            },
            'Save'
          ),
        ),
      ),

      // .css file upload (minified on upload)
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label', 'Upload .css')
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('input', {
            type: 'file',
            accept: '.css',
            onchange: events.upload,
            oncancel: events.upload,
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

      // storage location: sync (shared) or local (this device only)
      m('.row',
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('span.m-label', 'Storage')
        ),
        m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.storage
            },
            state._storages.map((s) =>
              m('option', {
                selected: (s === 'local') === state.local,
              }, s === 'local' ? 'local (this device)' : 'sync (shared)')
            )
          ),
          state.fallback &&
          m('span.m-label', {style: {display: 'block', marginTop: '6px'}},
            'too large for sync — kept locally on this device'
          )
        ),
      ),

      // color scheme (only for full custom; extend inherits the base color)
      state.theme && !state.base &&
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
