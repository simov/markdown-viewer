
var events = {
  advanced: () => {
    chrome.runtime.sendMessage({message: 'advanced'})
  }
}

function oncreate (vnode) {
  componentHandler.upgradeElements(vnode.dom)
}

m.mount(document.querySelector('body'), {
  view: () =>
    m('#popup',
      // advanced options
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.advanced},
        'Advanced Options')
    )
})
