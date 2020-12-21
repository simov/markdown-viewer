
module.exports = {
  // remark
  unified: require('unified'),
  parse: require('remark-parse'),
  stringify: require('remark-stringify'),
  // plugins
  gfm: require('remark-gfm'),
  breaks: require('remark-breaks'),
  html: require('remark-html'),
  slug: require('remark-slug'),
  footnotes: require('remark-footnotes'),
  frontmatter: require('remark-frontmatter'),
}
