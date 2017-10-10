
var mathjax = (
  (
    math = new RegExp([
      /\$\$[^`][\s\S]+?\$\$/,
      /\\\([^`][\s\S]+?\\\)/,
      /\\\[[^`][\s\S]+?\\\]/,
      /\\begin\{.*?\}[^`][\s\S]+?\\end\{.*?\}/,
      /\$[^$`].+?\$/,
    ].map((regex) => `(?:${regex.source})`).join('|'), 'gi'),
    escape = (math) => math.replace(/[<>&]/gi, (symbol) =>
      symbol === '>' ? '&gt;' :
      symbol === '<' ? '&lt;' :
      symbol === '&' ? '&amp;': null)
  ) => () => (
    (
      map = {}
    ) => ({
      tokenize: (markdown) =>
        markdown.replace(math, (str, offset) => (
          map[offset] = str,
          `?${offset}?`
        )),
      detokenize: (html) => (
        Object.keys(map).forEach((offset) =>
          html = html.replace(`?${offset}?`, () => escape(map[offset]))),
        delete map,
        html
      )
    })
  )()
)()
