
module.exports = {
  // remark
  unified: require('unified'),
  parse: require('remark-parse'),
  stringify: require('remark-stringify'),
  // plugins
  breaks: require('remark-breaks'),
  html: require('remark-html'),
  slug: require('remark-slug'),
  frontmatter: require('remark-frontmatter'),
}
