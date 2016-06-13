
function injectCSS (url) {
  var link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = url
  link.id = 'theme'
  document.head.appendChild(link)
}

$(function () {
  $('body').addClass('markdown-body') // github
  $('pre').attr('id', 'markdown').hide()

  chrome.extension.sendMessage({
    message: 'markdown',
    markdown: $('#markdown').text()
  }, (res) => {
    $('body').append('<div id="html">').find('#html').append(res.marked)
    Prism.highlightAll()
  })

  chrome.extension.sendMessage({message: 'settings'}, (data) => {
    if (!data.raw) {
      injectCSS(chrome.extension.getURL('/themes/' + data.theme + '.css'))
    }
    $('#markdown')[data.raw ? 'show' : 'hide']()
    $('#html')[data.raw ? 'hide' : 'show']()
  })

  $(window).on('load', () => {
    setTimeout(() => {
      var timeout = null
      $(window).on('scroll', () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          localStorage.setItem('scrolltop', $(window).scrollTop())
        }, 100)
      })

      $(window).scrollTop(localStorage.getItem('scrolltop'))
    }, 100)
  })
})

chrome.extension.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'reload') {
    window.location.reload(true)
  }
  else if (req.message === 'theme') {
    $('#theme').remove()
    injectCSS(chrome.extension.getURL('/themes/' + req.theme + '.css'))
  }
  else if (req.message === 'raw') {
    req.raw
      ? $('#theme').remove()
      : injectCSS(chrome.extension.getURL('/themes/' + req.theme + '.css'))
    $('#markdown, #html').toggle()
  }
})
