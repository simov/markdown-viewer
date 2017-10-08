
md.remark = {
  defaults: {
    breaks: false,
    commonmark: false,
    footnotes: false,
    gfm: true,
    pedantic: false,
    sanitize: false,
    // blocks (Array.<string>, default: list of block HTML elements)
  },
  description: {
    breaks: 'Exposes newline characters inside paragraphs as breaks',
    commonmark: 'Toggle CommonMark mode',
    footnotes: 'Toggle reference footnotes and inline footnotes',
    gfm: 'Toggle GFM (GitHub Flavored Markdown)',
    pedantic: 'Don\'t fix any of the original markdown\nbugs or poor behavior',
    sanitize: 'Disable HTML tag rendering',
  },
  compile: (markdown) =>
    remark.unified()
      .use(remark.parse, state.remark)
      .use(remark.stringify)
      .use(remarkSlug)
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(remarkHTML, state.remark) // sanitize
      .processSync(markdown)
      .contents
}
