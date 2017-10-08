
var mathjax = (
  (
    math = new RegExp([
      /\$\$[^$$]*\$\$/,
      /\\\[[^\]]*\\\]/,
      /\\begin\{[^}]*\}[\s\S]*?\\end\{[^}]*\}/,
      /\\\(.*\\\)/,
      /\$.*\$/
    ].map((regex) => `(?:${regex.source})`).join('|'), 'gi')
  ) => () => (
    (
      map = {}
    ) => ({
      tokenize: (markdown) =>
        markdown.replace(math, (str, offset) => (
          map[offset] = str,
          `.?.${offset}.?.`
        )),
      detokenize: (html) => (
        Object.keys(map).forEach((offset) =>
          html = html.replace(`.?.${offset}.?.`, map[offset])),
        delete map,
        html
      )
    })
  )()
)()
