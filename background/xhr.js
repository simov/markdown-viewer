
md.xhr = () => {

  var request = (url, done) => {
    ;(async () => {
      await new Promise(async (resolve, reject) => {
        try {
          var res = await fetch(url)
          done(null, await res.text())
        }
        catch (err) {
          done(err)
        }
      })
    })()
  }

  var get = (url, done) => request(url + '?preventCache=' + Date.now(), done)

  var raw = (url, done) => request(url, done)

  return {get, raw}
}
