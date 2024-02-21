
var origins = Origins()
var popup = Popup()

m.mount(document.querySelector('main'), {
  view: () => [
    origins.render(),
    popup.options(),
  ]
})

// header menu
document.querySelector('.nav').addEventListener('click', (e) => {
  e.preventDefault()
  Array.from(document.querySelectorAll('.nav a')).forEach((link) => {
    link.classList.remove('active')
  })
  if (e.target.innerText === 'Origins') {
    document.querySelector('.m-origins').classList.remove('hidden')
    document.querySelector('.m-settings').classList.add('hidden')
    e.target.classList.add('active')
  }
  else if (e.target.innerText === 'Settings') {
    document.querySelector('.m-origins').classList.add('hidden')
    document.querySelector('.m-settings').classList.remove('hidden')
    e.target.classList.add('active')
  }
  else if (e.target.innerText === 'Help') {
    window.location = 'https://github.com/simov/markdown-viewer#table-of-contents'
  }
})
