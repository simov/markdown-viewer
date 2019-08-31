
var origins = Origins()
var themes = Themes()

m.mount(document.querySelector('main'), {
  view: () => [
    // allowed origins
    origins.render(),
    // custom themes
    // themes.render(),
  ]
})

// ff: set appropriate footer icon
document.querySelector(
  '.icon-' + (/Firefox/.test(navigator.userAgent) ? 'firefox' : 'chrome')
).classList.remove('icon-hidden')
