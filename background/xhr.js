
md.xhr = () => {

  var get = (url, done) => {
    ;(async () => {
      await new Promise(async (resolve, reject) => {
        try {
          var bust = url.startsWith('file:') ? '' : '?preventCache=' + Date.now()
          var res = await fetch(url + bust)
          done(null, await res.text())
        }
        catch (err) {
          done(err)
        }
      })
    })()
  }

  return {get}
}
