
md.xhr = () => {
  var done

  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      done(null, xhr.responseText)
    }
  }

  var get = (url, _done) => {
    done = _done
    xhr.open('GET', url + '?preventCache=' + Date.now(), true)
    try {
      xhr.send()
    }
    catch (err) {
      console.error(err)
      done(err)
    }
  }

  return {get}
}
