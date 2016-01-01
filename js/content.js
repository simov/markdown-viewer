
function injectCSS () {
  var link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = '#'
  link.id = 'theme'
  document.head.appendChild(link)
}

$(function () {
  injectCSS()

  $('body').addClass('markdown-body')//github
  $('pre').attr('id', 'markdown').hide()

  chrome.extension.sendMessage({
    message: 'markdown',
    markdown: $('#markdown').text()
  }, function (res) {
    $('body').append('<div id="html">').find('#html').append(res.marked)
    Prism.highlightAll()
  })

  chrome.extension.sendMessage({
    message: 'settings',
  }, function (data) {
    $('#theme').attr('href', chrome.extension.getURL('/themes/'+data.theme+'.css'))

    $('#theme').attr('disabled', data.raw)
    $('#markdown')[data.raw?'show':'hide']()
    $('#html')[data.raw?'hide':'show']()
  })

  $(window).on('load', function (e) {
    setTimeout(function () {
      var timeout = null
      $(window).on('scroll', function (e) {
        clearTimeout(timeout)
        timeout = setTimeout(function () {
          localStorage.setItem('scrolltop', $(window).scrollTop())
        }, 100)
      })

      $(window).scrollTop(localStorage.getItem('scrolltop'))
    }, 100)
  })
})

chrome.extension.onMessage.addListener(function (req, sender, sendResponse) {
  switch (req.message) {
    case 'reload':
      window.location.reload(true)
      break

    case 'theme':
      var raw = $('#theme').attr('disabled') == 'disabled'
      $('#theme').remove()
      injectCSS()
      $('#theme').attr('href', chrome.extension.getURL('/themes/'+req.theme+'.css'))
      $('#theme').attr('disabled', raw)
      break

    case 'raw':
      $('#theme').attr('disabled', !($('#theme').attr('disabled') == 'disabled'))
      $('#markdown, #html').toggle()
      break
  }
})
