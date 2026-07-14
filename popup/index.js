
var Popup = () => {

  var state = {
    compiler: '',
    options: {},
    content: {},
    theme: '',
    themes: {},
    _themes: [
      'github',
      'github-dark',
      // 'air',
      'almond',
      'awsm',
      'axist',
      'bamboo',
      'bullframe',
      'holiday',
      'kacit',
      'latex',
      'marx',
      'mini',
      'modest',
      'new',
      'no-class',
      'pico',
      'retro',
      'sakura',
      'sakura-vader',
      'semantic',
      'simple',
      // 'splendor',
      'style-sans',
      'style-serif',
      'stylize',
      'superstylin',
      'tacit',
      'vanilla',
      'water',
      'water-dark',
      'writ',
      'custom',
    ],
    _width: [
      'auto',
      'full',
      'wide',
      'large',
      'medium',
      'small',
      'tiny',
    ],
    raw: false,
    tab: '',
    tabs: ['theme', 'compiler', 'content', 'preview', 'history'],
    compilers: [],
    description: {
      themes: {},
      compiler: {},
      content: {
        autoreload: 'Auto reload on file change',
        emoji: 'Convert emoji :shortnames: into EmojiOne images',
        toc: 'Generate Table of Contents',
        mathjax: 'Render MathJax formulas',
        mermaid: 'Mermaid diagrams',
        syntax: 'Syntax highlighting for fenced code blocks',
      }
    },
    settings: {},
    tempMarkdown: '',
    history: [],
    editingId: null,
    editingTitle: '',
    dragging: false,
    loading: false,
    loadingMessage: ''
  }

  var openPreview = (previewUrl) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      var activeTab = tabs[0]
      var isNewTab = activeTab && activeTab.url && (
        activeTab.url === 'chrome://newtab/' ||
        activeTab.url === 'about:newtab' ||
        activeTab.url === 'about:home' ||
        activeTab.url === 'about:blank' ||
        activeTab.url.startsWith('chrome-search://')
      )
      if (isNewTab) {
        chrome.tabs.update(activeTab.id, { url: previewUrl })
      } else {
        chrome.tabs.create({ url: previewUrl })
      }
    })
  }

  var events = {
    tab: (e) => {
      state.tab = e.target.hash.replace('#tab-', '')
      localStorage.setItem('tab', state.tab)
      return false
    },

    dragover: (e) => {
      e.preventDefault()
      state.dragging = true
    },

    dragenter: (e) => {
      e.preventDefault()
      state.dragging = true
    },

    dragleave: (e) => {
      state.dragging = false
    },

    drop: (e) => {
      e.preventDefault()
      state.dragging = false

      var files = e.dataTransfer.files
      if (files.length === 0) return

      var file = files[0]
      var ext = file.name.split('.').pop().toLowerCase()

      if (ext === 'docx') {
        state.loading = true
        state.loadingMessage = 'Loading DOCX file...'
        m.redraw()

        var reader = new FileReader()
        reader.onload = (event) => {
          var base64String = event.target.result.split(',')[1]
          state.tempMarkdown = `[DOCX Document] ${file.name}`
          chrome.storage.local.set({ 
            temporaryDocx: base64String,
            temporaryMarkdown: state.tempMarkdown
          }, () => {
            state.loading = false
            state.loadingMessage = ''
            m.redraw()
          })
        }
        reader.onerror = (err) => {
          console.error(err)
          state.loading = false
          state.loadingMessage = ''
          alert('Error reading DOCX file')
          m.redraw()
        }
        reader.readAsDataURL(file)
      } else {
        state.loading = true
        state.loadingMessage = 'Reading file...'
        m.redraw()

        var reader = new FileReader()
        reader.onload = (event) => {
          state.tempMarkdown = event.target.result
          chrome.storage.local.set({ temporaryMarkdown: state.tempMarkdown })
          state.loading = false
          state.loadingMessage = ''
          m.redraw()
        }
        reader.readAsText(file)
      }
    },

    compiler: {
      name: (e) => {
        state.compiler = state.compilers[e.target.selectedIndex]
        chrome.runtime.sendMessage({
          message: 'popup.compiler.name',
          compiler: state.compiler,
        }, () => {
          chrome.runtime.sendMessage({message: 'popup'}, init)
        })
      },
      options: (e) => {
        state.options[e.target.name] = !state.options[e.target.name]
        chrome.runtime.sendMessage({
          message: 'popup.compiler.options',
          compiler: state.compiler,
          options: state.options,
        })
      }
    },

    content: (e) => {
      state.content[e.target.name] = !state.content[e.target.name]
      chrome.runtime.sendMessage({
        message: 'popup.content',
        content: state.content,
      })
    },

    themes: (e) => {
      state.themes.width = state._width[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.themes',
        themes: state.themes,
      })
    },

    theme: (e) => {
      state.theme = state._themes[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.theme',
        theme: state.theme
      })
    },

    raw: () => {
      state.raw = !state.raw
      chrome.runtime.sendMessage({
        message: 'popup.raw',
        raw: state.raw
      })
    },

    defaults: () => {
      chrome.runtime.sendMessage({
        message: 'popup.defaults'
      }, () => {
        chrome.runtime.sendMessage({message: 'popup'}, init)
        localStorage.removeItem('tab')
        state._tabs.activeTabIndex = 0
      })
    },

    advanced: () => {
      chrome.runtime.sendMessage({message: 'popup.advanced'})
    },

    preview: () => {
      chrome.storage.local.set({ temporaryMarkdown: state.tempMarkdown || '' }, () => {
        chrome.storage.local.get('previewHistory', (localRes) => {
          var history = localRes.previewHistory || []
          
          var title = ''
          var lines = (state.tempMarkdown || '').trim().split('\n')
          if (lines.length && lines[0].startsWith('#')) {
            title = lines[0].replace(/^#+\s*/, '').trim()
          }
          if (!title) {
            var snippet = (state.tempMarkdown || '').trim().substring(0, 30)
            title = snippet ? (snippet + (state.tempMarkdown.length > 30 ? '...' : '')) : 'Empty Markdown'
          }
          
          var historyItem = {
            id: Date.now().toString(),
            title: title,
            timestamp: new Date().toLocaleString(),
            markdown: state.tempMarkdown || ''
          }
          
          history.unshift(historyItem)
          if (history.length > 50) {
            history = history.slice(0, 50)
          }
          state.history = history
          
          chrome.storage.local.set({ previewHistory: history }, () => {
            openPreview(chrome.runtime.getURL('/content/preview.html'))
          })
        })
      })
    },

    clear: () => {
      state.tempMarkdown = ''
      chrome.storage.local.set({ temporaryMarkdown: '', temporaryDocx: '' }, () => {
        m.redraw()
      })
    },

    reopenHistory: (item) => {
      chrome.storage.local.set({ temporaryMarkdown: item.markdown, temporaryDocx: '' }, () => {
        openPreview(chrome.runtime.getURL('/content/preview.html'))
      })
    },

    startRename: (item) => {
      state.editingId = item.id
      state.editingTitle = item.title
    },

    saveRename: (itemId) => {
      if (state.editingTitle.trim() !== '') {
        var history = state.history.map((item) => {
          if (item.id === itemId) {
            item.title = state.editingTitle.trim()
          }
          return item
        })
        state.history = history
        chrome.storage.local.set({ previewHistory: history }, () => {
          state.editingId = null
          state.editingTitle = ''
          m.redraw()
        })
      }
    },

    cancelRename: () => {
      state.editingId = null
      state.editingTitle = ''
    },

    deleteHistory: (itemId) => {
      var history = state.history.filter((item) => item.id !== itemId)
      state.history = history
      chrome.storage.local.set({ previewHistory: history }, () => {
        m.redraw()
      })
    }
  }

  var init = (res) => {
    state.compiler = res.compiler
    state.options = res.options
    state.content = res.content
    state.theme = res.theme
    state.themes = res.themes

    state.raw = res.raw
    state.tab = localStorage.getItem('tab') || 'preview'
    state.compilers = res.compilers
    state.description.compiler = res.description

    state.settings = res.settings
    document.querySelector('body').classList.add(state.settings.theme)

    m.redraw()
  }

  chrome.runtime.sendMessage({message: 'popup'}, (res) => {
    chrome.storage.local.get(['temporaryMarkdown', 'previewHistory'], (localRes) => {
      state.tempMarkdown = localRes.temporaryMarkdown || ''
      state.history = localRes.previewHistory || []
      init(res)
    })
  })

  var oncreate = {
    ripple: (vnode) => {
      mdc.ripple.MDCRipple.attachTo(vnode.dom)
    },
    tabs: (vnode) => {
      state._tabs = mdc.tabs.MDCTabBar.attachTo(vnode.dom)
      setTimeout(() => {
        state._tabs.activeTabIndex = state.tabs.indexOf(state.tab)
      }, 250)
    }
  }

  var onupdate = (tab, key) => (vnode) => {
    var value = tab === 'compiler' ? state.options[key]
      : tab === 'content' ? state.content[key]
      : null

    if (vnode.dom.classList.contains('is-checked') !== value) {
      vnode.dom.classList.toggle('is-checked')
    }
  }

  var render = () =>
    m('#popup',
      // raw
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.raw
        },
        (state.raw ? 'Html' : 'Markdown')
      ),
      // defaults
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.defaults
        },
        'Defaults'
      ),

      // tabs
      m('nav.mdc-tab-bar m-tabs', {
        oncreate: oncreate.tabs,
        onclick: events.tab
        },
        state.tabs.map((tab) =>
        m('a.mdc-tab', {
          href: '#tab-' + tab,
          },
          tab
        )),
        m('span.mdc-tab-bar__indicator')
      ),
      m('.m-panels',
        // theme
        m('.m-panel', {
          class: state.tab === 'theme' ? 'is-active' : ''
          },
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.theme
            },
            state._themes.map((theme) =>
              m('option', {selected: state.theme === theme}, theme)
            )
          ),
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.themes
            },
            state._width.map((width) =>
              m('option', {
                selected: state.themes.width === width,
              }, width)
            )
          ),
        ),
        // compiler
        m('.m-panel', {
          class: state.tab === 'compiler' ? 'is-active' : ''
          },
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.compiler.name
            },
            state.compilers.map((name) =>
              m('option', {selected: state.compiler === name}, name)
            )
          ),
          m('.scroll', {
            class: Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .length > 8
              ? 'max' : ''
            },
            Object.keys(state.options)
            .filter((key) => typeof state.options[key] === 'boolean')
            .map((key) =>
              m('label.mdc-switch m-switch', {
                onupdate: onupdate('compiler', key),
                title: state.description.compiler[key]
                },
                m('input.mdc-switch__native-control', {
                  type: 'checkbox',
                  name: key,
                  checked: state.options[key],
                  onchange: events.compiler.options
                }),
                m('.mdc-switch__background', m('.mdc-switch__knob')),
                m('span.mdc-switch-label', key)
              )
            )
          )
        ),
        // content
        m('.m-panel', {
          class: state.tab === 'content' ? 'is-active' : ''
          },
          m('.scroll', Object.keys(state.content).map((key) =>
            m('label.mdc-switch m-switch', {
              onupdate: onupdate('content', key),
              title: state.description.content[key]
              },
              m('input.mdc-switch__native-control', {
                type: 'checkbox',
                name: key,
                checked: state.content[key],
                onchange: events.content
              }),
              m('.mdc-switch__background', m('.mdc-switch__knob')),
              m('span.mdc-switch-label', key)
            ))
          )
        ),
        // preview
        m('.m-panel', {
          class: state.tab === 'preview' ? 'is-active' : ''
          },
          m('textarea.preview-textarea', {
            class: state.dragging ? 'drag-over' : '',
            disabled: state.loading,
            placeholder: state.loading ? state.loadingMessage : 'Paste your Markdown, or drag & drop a .md / .docx file here...',
            value: state.loading ? state.loadingMessage : state.tempMarkdown,
            oninput: (e) => {
              state.tempMarkdown = e.target.value
            },
            ondragover: events.dragover,
            ondragenter: events.dragenter,
            ondragleave: events.dragleave,
            ondrop: events.drop
          }),
          m('.preview-controls',
            m('button.mdc-button mdc-button--raised m-button clear-btn', {
              oncreate: oncreate.ripple,
              disabled: state.loading,
              onclick: events.clear
            }, 'Clear'),
            m('button.mdc-button mdc-button--raised m-button preview-btn-half', {
              oncreate: oncreate.ripple,
              disabled: state.loading,
              onclick: events.preview
            }, 'Preview')
          )
        ),
        // history
        m('.m-panel', {
          class: state.tab === 'history' ? 'is-active' : ''
          },
          m('.scroll.history-scroll',
            state.history && state.history.length ?
              state.history.map((item) =>
                m('.history-item',
                  m('.history-info',
                    state.editingId === item.id ?
                      m('input.edit-title-input', {
                        value: state.editingTitle,
                        oninput: (e) => {
                          state.editingTitle = e.target.value
                        },
                        onkeydown: (e) => {
                          if (e.key === 'Enter') events.saveRename(item.id)
                          if (e.key === 'Escape') events.cancelRename()
                        }
                      })
                    : [
                        m('.history-title', item.title),
                        m('.history-time', item.timestamp)
                      ]
                  ),
                  state.editingId === item.id ?
                    m('.history-actions',
                      m('button.action-btn.save-btn', {
                        title: 'Save',
                        onclick: () => events.saveRename(item.id)
                      }, m.trust('<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>')),
                      m('button.action-btn.discard-btn', {
                        title: 'Discard',
                        onclick: () => events.cancelRename()
                      }, m.trust('<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'))
                    )
                  :
                    m('.history-actions',
                      m('button.action-btn.reopen-btn', {
                        title: 'Open preview',
                        onclick: () => events.reopenHistory(item)
                      }, m.trust('<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>')),
                      m('button.action-btn.rename-btn', {
                        title: 'Rename',
                        onclick: () => events.startRename(item)
                      }, m.trust('<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>')),
                      m('button.action-btn.delete-btn', {
                        title: 'Delete',
                        onclick: () => events.deleteHistory(item.id)
                      }, m.trust('<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'))
                    )
                )
              )
            : m('.history-empty', 'No preview history found.')
          )
        )
      ),

      // advanced options
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.advanced
        },
        'Advanced Options'
      )
    )

  var options = () =>
    m('.row m-settings hidden',
      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', 'Theme'),
        m('.bs-callout m-theme',
          m('.row',
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('span.m-label',
                'Content Theme'
              )
            ),
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('select.mdc-elevation--z2 m-select', {
                onchange: events.theme
                },
                state._themes.map((theme) =>
                  m('option', {selected: state.theme === theme}, theme)
                )
              )
            ),
          ),
          m('.row',
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('span.m-label',
                'Content Width'
              )
            ),
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('select.mdc-elevation--z2 m-select', {
                onchange: events.themes
                },
                state._width.map((width) =>
                  m('option', {
                    selected: state.themes.width === width,
                  }, width)
                )
              )
            ),
          ),
          settings.render()
        ),
        state.theme === 'custom' &&
        custom.render()
      ),

      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', 'Compiler'),
        m('.bs-callout m-compiler',
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.compiler.name
            },
            state.compilers.map((name) =>
              m('option', {selected: state.compiler === name}, name)
            )
          ),
          m('.scroll', {
            class: Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .length > 8
              ? 'max' : ''
            },
            Object.keys(state.options)
            .filter((key) => typeof state.options[key] === 'boolean')
            .map((key) =>
              m('label.mdc-switch m-switch', {
                onupdate: onupdate('compiler', key),
                title: state.description.compiler[key]
                },
                m('input.mdc-switch__native-control', {
                  type: 'checkbox',
                  name: key,
                  checked: state.options[key],
                  onchange: events.compiler.options
                }),
                m('.mdc-switch__background', m('.mdc-switch__knob')),
                m('span.mdc-switch-label', key)
              )
            )
          )
        ),
      ),

      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', 'Content'),
        m('.bs-callout m-content',
          m('.scroll', Object.keys(state.content).map((key) =>
            m('label.mdc-switch m-switch', {
              onupdate: onupdate('content', key),
              title: state.description.content[key]
              },
              m('input.mdc-switch__native-control', {
                type: 'checkbox',
                name: key,
                checked: state.content[key],
                onchange: events.content
              }),
              m('.mdc-switch__background', m('.mdc-switch__knob')),
              m('span.mdc-switch-label', key)
            ))
          )
        ),
      ),
    )

  return {state, render, options}
}

if (document.querySelector('.is-popup')) {
  var popup = Popup()
  m.mount(document.querySelector('body'), {
    view: (vnode) => popup.render()
  })
}
else {
  var settings = Settings()
  var custom = Custom()
}
