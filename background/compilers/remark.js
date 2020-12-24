
md.compilers.remark = (() => {
  var defaults = {
    breaks: false,
    footnotes: false,
    gfm: true,
    sanitize: false,
  }

  var description = {
    breaks: 'Exposes newline characters inside paragraphs as breaks',
    footnotes: 'Toggle reference footnotes and inline footnotes',
    gfm: 'Toggle GFM (GitHub Flavored Markdown)',
    sanitize: 'Disable HTML tag rendering',
  }

  var ctor = ({storage: {state}}) => ({
    defaults,
    description,
    compile: (markdown) =>
      remark.unified()
        .use(remark.parse)
        .use(state.remark.gfm ? remark.gfm : undefined)
        .use(state.remark.breaks ? remark.breaks : undefined)
        .use(state.remark.footnotes ? remark.footnotes : undefined)
        .use(remark.stringify)
        .use(remark.slug)
        .use(remark.frontmatter, ['yaml', 'toml'])
        .use(remark.html, state.remark) // sanitize
        .processSync(markdown)
        .contents
  })

  return Object.assign(ctor, {defaults, description})
})()
