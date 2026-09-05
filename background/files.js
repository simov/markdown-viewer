
md.files = ({storage: {state}, xhr}) => {

  var unescape = (str) =>
    str.replace(/&(amp|lt|gt|quot|#39);/g, (_, name) => ({
      amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'"
    }[name]))

  // chrome: <script>addRow("name","href",isdir,size,"size",modified,"modified");</script>
  var chrome = (html) => {
    var regex = /addRow\("((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)",(\d)/g
    var entries = []
    var match
    while ((match = regex.exec(html))) {
      entries.push({
        name: JSON.parse(`"${match[1]}"`),
        href: match[2],
        dir: match[3] === '1',
      })
    }
    return entries
  }

  // firefox: <a class="dir" href="name/">name</a> / <a class="file" href="name">name</a>
  var firefox = (html) => {
    var regex = /<a class="(dir|file)" href="([^"]*)">([^<]*)<\/a>/g
    var entries = []
    var match
    while ((match = regex.exec(html))) {
      entries.push({
        name: unescape(match[3]),
        href: match[2],
        dir: match[1] === 'dir',
      })
    }
    return entries
  }

  var parse = (base, html) => {
    var origin = state.origins['file://']
    var match = new RegExp(origin && origin.match || state.match)

    var entries = (/addRow\(/.test(html) ? chrome(html) : firefox(html))
      .filter(({name}) => name !== '.' && name !== '..' && name[0] !== '.')
      .map(({name, href, dir}) => ({
        name,
        dir,
        url: base + href.replace(/\/+$/, '') + (dir ? '/' : ''),
      }))
      .filter(({dir, url}) => dir || match.test(url))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}))

    return {
      dirs: entries.filter(({dir}) => dir),
      files: entries.filter(({dir}) => !dir),
    }
  }

  var get = (url, done) => {
    var base = url.replace(/\/*$/, '/')
    xhr.raw(base, (err, body) => {
      if (err) {
        done({err: err.message || String(err)})
      }
      else {
        done(parse(base, body))
      }
    })
  }

  return {get, parse}
}
