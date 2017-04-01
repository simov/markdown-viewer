
md['markdown-it'] = {
  defaults: {
    breaks: true,
    html: true,
    linkify: true,
    typographer: false,
    xhtmlOut: false,
    langPrefix: 'language-',
    quotes: '“”‘’'
    // highlight: (str, lang) => ''
  },
  description: {
    breaks: 'Convert \\n in paragraphs into <br>',
    html: 'Enable HTML tags in source',
    linkify: 'Autoconvert URL-like text to links',
    typographer: 'Enable some language-neutral replacement + quotes beautification',
    xhtmlOut: 'Use / to close single tags (<br />)'
  },
  compile: (markdown, sendResponse) => {
    chrome.storage.sync.get('markdown-it', (res) => {
      var md = window.markdownit(res['markdown-it'])
      var html = md.render(markdown)
      sendResponse({message: 'html', html})
    })
  }
}
