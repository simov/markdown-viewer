
var md = {compilers: {}}

md.compilers['markdown-it'] = (() => {
  var defaults = {
    breaks: false,
    html: true,
    linkify: true,
    typographer: false,
    xhtmlOut: false,
    langPrefix: 'language-',
    quotes: '“”‘’',
    // plugins
    abbr: false,
    attrs: false,
    cjk: false,
    deflist: false,
    footnote: false,
    ins: false,
    mark: false,
    sub: false,
    sup: false,
    tasklists: false,
  }

  var description = {
    breaks: 'Convert \\n in paragraphs into <br>',
    html: 'Enable HTML tags in source',
    linkify: 'Autoconvert URL-like text to links',
    typographer: 'Enable some language-neutral replacement + quotes beautification',
    xhtmlOut: 'Use / to close single tags (<br />)',
    // plugins
    abbr: 'Abbreviation <abbr>\n*[word]: Text',
    attrs: 'Custom attributes\n# header {#id}',
    cjk: 'Suppress linebreaks between east asian characters',
    deflist: 'Definition list <dl>\ntitle\n: definition',
    footnote: 'Footnotes\nword[^1]\n[^1]: text',
    ins: 'Inserted text <ins>\n++text++',
    mark: 'Marked text <mark>\n==text==',
    sub: 'Subscript <sub>\n~text~',
    sup: 'Superscript <sup>\n^text^',
    tasklists: 'Task lists\n- [x]\n- [ ]',
  }

  var ctor = ({storage: {state}}) => ({
    defaults,
    description,
    compile: (markdown) =>
      mdit.mdit(state['markdown-it'])
        .use(mdit.anchor, {
          slugify: (s) => new mdit.slugger().slug(s)
        })
        .use(state['markdown-it'].abbr ? mdit.abbr : () => {})
        .use(state['markdown-it'].attrs ? mdit.attrs : () => {})
        .use(state['markdown-it'].cjk ? mdit.cjk : () => {})
        .use(state['markdown-it'].deflist ? mdit.deflist : () => {})
        .use(state['markdown-it'].footnote ? mdit.footnote : () => {})
        .use(state['markdown-it'].ins ? mdit.ins : () => {})
        .use(state['markdown-it'].mark ? mdit.mark : () => {})
        .use(state['markdown-it'].sub ? mdit.sub : () => {})
        .use(state['markdown-it'].sup ? mdit.sup : () => {})
        .use(state['markdown-it'].tasklists ? mdit.tasklists : () => {})
        .render(markdown)
  })

  return Object.assign(ctor, {defaults, description})
})()
