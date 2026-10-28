
;(() => {
  var current = ''

  var response = (md) => {
    if (!current) {
      current = md
    }
    else if (current !== md) {
      state.reload.md = true
      current = md
      render(md)
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
          clearInterval(state.reload.interval)
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
        clearInterval(state.reload.interval)
      }
    }
  }

  get()
  state.reload.interval = setInterval(get, state.reload.ms)
})()
