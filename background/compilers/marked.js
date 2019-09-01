
var md = {compilers: {}}

md.compilers.marked = (() => {
  var defaults = {
    breaks: false,
    gfm: true,
    pedantic: false,
    sanitize: false,
    smartLists: false,
    smartypants: false,
    langPrefix: 'language-' // prism
  }

  var description = {
    breaks: 'Enable GFM line breaks\n(requires the gfm option to be true)',
    gfm: 'Enable GFM\n(GitHub Flavored Markdown)',
    pedantic: 'Don\'t fix any of the original markdown\nbugs or poor behavior',
    sanitize: 'Ignore any HTML\nthat has been input',
    smartLists: 'Use smarter list behavior\nthan the original markdown',
    smartypants: 'Use "smart" typographic punctuation\nfor things like quotes and dashes'
  }

  var ctor = ({storage: {state}}) => ({
    defaults,
    description,
    compile: (markdown) =>
      marked(markdown, state.marked)
  })

  return Object.assign(ctor, {defaults, description})
})()
