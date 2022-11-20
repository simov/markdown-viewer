
;(() => {
  var initial = ''

  var response = (body) => {
    if (!initial) {
      initial = body
    }
    else if (initial !== body) {
      location.reload(true)
    }
  }

  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      response(xhr.responseText)
    }
  }

  var get = () => {
    if (location.protocol === 'file:') {
      chrome.runtime.sendMessage({
        message: 'autoreload',
        location: location.href
      }, (res) => {
        if (res.err) {
          console.error(res.err)
          clearInterval(state.interval)
        }
        else {
          response(res.body)
        }
      })
    }
    else {
      xhr.open('GET', location.href + '?preventCache=' + Date.now(), true)
      try {
        xhr.send()
      }
      catch (err) {
        console.error(err)
        clearInterval(state.interval)
      }
    }
  }

  get()
  state.interval = setInterval(get, state.ms)
})()
