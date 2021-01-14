
var origins = Origins()

m.mount(document.querySelector('main'), {
  view: () => [
    // allowed origins
    origins.render(),
  ]
})

// ff: set appropriate footer icon
document.querySelector('.icon-' + (
  /Firefox/.test(navigator.userAgent) ? 'firefox' :
  /Edg/.test(navigator.userAgent) ? 'edge' :
  'chrome'
)).classList.remove('icon-hidden')
