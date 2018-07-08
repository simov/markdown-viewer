
md.mathjax = () => {

  var delimiters = new RegExp([
    /\$\$[^`]*?\$\$/,
    /\\\([^`]*?\\\)/,
    /\\\[[^`]*?\\\]/,
    /\\begin\{.*?\}[^`]*?\\end\{.*?\}/,
    /\$[^`\n]*?\$/,
  ]
  .map((regex) => `(?:${regex.source})`).join('|'), 'gi')

  var escape = (math) =>
    math.replace(/[<>&]/gi, (symbol) =>
      symbol === '>' ? '&gt;' :
      symbol === '<' ? '&lt;' :
      symbol === '&' ? '&amp;': null
    )

  var ctor = (map = {}) => ({
    tokenize: (markdown) =>
      markdown.replace(delimiters, (str, offset) => (
        map[offset] = str,
        `?${offset}?`
      ))
    ,
    detokenize: (html) =>
      Object.keys(map)
        .reduce((html, offset) =>
          html = html.replace(`?${offset}?`, () => escape(map[offset])),
          html
        )
  })

  return Object.assign(ctor, {delimiters, escape})
}
