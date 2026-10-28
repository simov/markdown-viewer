
md.compilers.showdown = (() => {
  var defaults = null // see below

  var description = {
    disableForced4SpacesIndentedSublists: 'Disables the requirement of indenting nested sublists by 4 spaces',
    encodeEmails: 'Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities',
    ghCodeBlocks: 'Turn on/off GFM fenced code blocks support',
    ghCompatibleHeaderId: 'Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)',
    ghMentions: 'Enables github @mentions',
    literalMidWordUnderscores: 'Parse midword underscores as literal underscores',
    noHeaderId: 'Turn on/off generated header id',
    omitExtraWLInCodeBlocks: 'Omit the default extra whiteline added to code blocks',
    parseImgDimensions: 'Turn on/off image dimension parsing',
    prefixHeaderId: 'Specify a prefix to generated header ids',
    requireSpaceBeforeHeadingText: 'Makes adding a space between `#` and the header text mandatory (GFM Style)',
    simpleLineBreaks: 'Parses simple line breaks as <br> (GFM Style)',
    simplifiedAutoLink: 'Turn on/off GFM autolink style',
    smartIndentationFix: 'Tries to smartly fix indentation in es6 strings',
    smoothLivePreview: 'Prevents weird effects in live previews due to incomplete input',
    strikethrough: 'Turn on/off strikethrough support',
    tables: 'Turn on/off tables support',
    tablesHeaderId: 'Add an id to table headers',
    tasklists: 'Turn on/off GFM tasklist support',
    customizedHeaderId: 'Use text in curly braces as header id',
    rawPrefixHeaderId: 'Prevent modifying the prefix',
    rawHeaderId: 'Remove only spaces, \' and \' from generated header ids',
    tablesHeaderId: 'Adds an id property to table headers tags',
    openLinksInNewWindow: 'Open all links in new windows',
    backslashEscapesHTMLTags: 'Support for HTML Tag escaping',
    emoji: 'Enable emoji support',
    ellipsis: 'Replaces three dots with the ellipsis unicode character',
    metadata: 'Enable support for document metadata',
    splitAdjacentBlockquotes: 'Split adjacent blockquote blocks',
  }

  var flavor = (name) => {
    var options = showdown.getDefaultOptions()
    var flavor = showdown.getFlavorOptions(name)
    var result = {}
    for (var key in options) {
      result[key] = (flavor[key] !== undefined) ? flavor[key] : options[key]
    }
    return result
  }

  defaults = flavor('github')

  var ctor = ({storage: {state}}) => ({
    defaults,
    description,
    compile: (markdown) =>
      new showdown.Converter(state.showdown)
        .makeHtml(markdown)
  })

  return Object.assign(ctor, {defaults, description})
})()
