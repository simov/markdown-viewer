
md.remark = {
  defaults: {
    gfm: true,
    yaml: true,
    commonmark: false,
    footnotes: false,
    pedantic: false,
    breaks: false,
    sanitize: false
    // blocks (Array.<string>, default: list of block HTML elements)
  },
  compile: (markdown, sendResponse) => {
    chrome.storage.sync.get('remark', (res) => {
      var html = remark.unified()
        .use(remark.parse, res.remark)
        .use(remark.stringify)
        .use(remarkSlug)
        .use(remarkHTML, res.remark) // sanitize
        .processSync(markdown)
        .contents
      sendResponse({message: 'html', html})
    })
  }
}
