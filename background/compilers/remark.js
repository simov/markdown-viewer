
md.compilers.remark = (() => {
  var defaults = {
    breaks: false,
    commonmark: false,
    footnotes: false,
    gfm: true,
    pedantic: false,
    sanitize: false,
  }

  var description = {
    breaks: 'Exposes newline characters inside paragraphs as breaks',
    commonmark: 'Toggle CommonMark mode',
    footnotes: 'Toggle reference footnotes and inline footnotes',
    gfm: 'Toggle GFM (GitHub Flavored Markdown)',
    pedantic: 'Don\'t fix any of the original markdown\nbugs or poor behavior',
    sanitize: 'Disable HTML tag rendering',
  }

  var ctor = ({storage: {state}}) => ({
    defaults,
    description,
    compile: (markdown) =>
      remark.unified()
        .use(remark.parse, state.remark) // commonmark, gfm, pedantic, footnotes
        .use(state.remark.breaks ? remark.breaks : undefined) // breaks
        .use(remark.stringify)
        .use(remark.slug)
        .use(remark.frontmatter, ['yaml', 'toml'])
        .use(remark.html, state.remark) // sanitize
        .processSync(markdown)
        .contents
  })

  return Object.assign(ctor, {defaults, description})
})()
