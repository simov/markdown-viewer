
md.xhr = () => {

  var get = (url, done) => {
    ;(async () => {
      await new Promise(async (resolve, reject) => {
        try {
          var res = await fetch(url + '?preventCache=' + Date.now())
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
