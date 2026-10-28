
md.compilers.marked = (() => {
  var defaults = {
    breaks: false,
    gfm: true,
    pedantic: false,
    // plugins
    linkify: true,
    smartypants: false,
  }

  var description = {
    breaks: 'Enable GFM line breaks\n(requires the gfm option to be true)',
    gfm: 'Enable GFM\n(GitHub Flavored Markdown)',
    pedantic: 'Don\'t fix any of the original markdown\nbugs or poor behavior',
    // plugins
    linkify: 'Autoconvert URL-like text to links',
    smartypants: 'Use "smart" typographic punctuation\nfor things like quotes and dashes'
  }

  var ctor = ({storage: {state}}) => ({
    defaults,
    description,
    compile: (markdown) =>
      new marked.marked(
        state.marked,
        marked.headings(),
        state.marked.linkify ? marked.linkify() : () => {},
        state.marked.smartypants ? marked.smartypants() : () => {},
      ).parse(markdown)
  })

  return Object.assign(ctor, {defaults, description})
})()
