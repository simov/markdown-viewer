
var origins = Origins()
var settings = Settings()

m.mount(document.querySelector('main'), {
  view: () => [
    origins.render(),
    settings.render(),
  ]
})

// header menu
document.querySelector('#menu span').addEventListener('click', (e) => {
  e.preventDefault()
  document.querySelector('#menu div').classList.toggle('hidden')
})
document.querySelector('#menu div').addEventListener('click', (e) => {
  e.preventDefault()
  Array.from(document.querySelectorAll('#menu em')).forEach((link) => {
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
  document.querySelector('#menu div').classList.add('hidden')
})
