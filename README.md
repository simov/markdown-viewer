
# Markdown Viewer / Chrome Extension


## [Install][chrome-store]


## Features

- No special permissions required for file URLs
- Full control over the allowed origins
- Supports [GitHub Flavored Markdown][gfm]
- Multiple markdown parsers
- Full control over the [compiler options][compiler-options] ([marked][marked] or [showdown][showdown])
- Themes support (including [GitHub theme][themes0]) ([jasonm23][themes1], [mixu][themes2], [cobalt][themes3])
- Syntax highlighted code blocks ([prism][prism])
- Generates Table of Contents (TOC)
- Remembers scroll position
- Settings synchronization
- Raw and rendered markdown views
- Open source


## Local Files

1. Navigate to `chrome://extensions`
2. Make sure that the `Allow access to file URLs` checkbox is checked for the Markdown Viewer extension

![file-urls]


## Remote Files

1. Click on the Markdown Viewer icon and select `Options`
2. Add the origin that you want enabled for the Markdown Viewer extension


## Compiler Options

### Marked

Option          | Default | Description
:---            | :---    | :---
**gfm**         | `true`  | Enable GFM [GitHub Flavored Markdown][gfm].
**tables**      | `true`  | Enable GFM [tables][gfm-tables]. This option requires the gfm option to be true.
**breaks**      | `false` | Enable GFM [line breaks][gfm]. This option requires the gfm option to be true.
**pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
**sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.
**smartLists**  | `false` | Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
**smartypants** | `false` | Use "smart" typograhic punctuation for things like quotes and dashes.

### Showdown

Option          | Default | Description
:---            | :---    | :---
**disableForced4SpacesIndentedSublists** | `true` | Disables the requirement of indenting nested sublists by 4 spaces
**encodeEmails** | `true` | Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities
**excludeTrailingPunctuationFromURLs** | `true` | Excludes trailing punctuation from links generated with autoLinking
**ghCodeBlocks** | `true` | Turn on/off GFM fenced code blocks support
**ghCompatibleHeaderId** | `true` | Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)
**ghMentions** | `true` | Enables github @mentions
**headerLevelStart** | `false` | The header blocks level start
**literalMidWordUnderscores** | `true` | Parse midword underscores as literal underscores
**noHeaderId** | `false` | Turn on/off generated header id
**omitExtraWLInCodeBlocks** | `true` | Omit the default extra whiteline added to code blocks
**parseImgDimensions** | `false` | Turn on/off image dimension parsing
**prefixHeaderId** | `false` | Specify a prefix to generated header ids
**requireSpaceBeforeHeadingText** | `true` | Makes adding a space between `#` and the header text mandatory (GFM Style)
**simpleLineBreaks** | `true` | Parses simple line breaks as <br> (GFM Style)
**simplifiedAutoLink** | `true` | Turn on/off GFM autolink style
**smartIndentationFix** | `false` | Tries to smartly fix indentation in es6 strings
**smoothLivePreview** | `false` | Prevents weird effects in live previews due to incomplete input
**strikethrough** | `true` | Turn on/off strikethrough support
**tables** | `true` | Turn on/off tables support
**tablesHeaderId** | `true` | Add an id to table headers
**tasklists** | `true` | Turn on/off GFM tasklist support


## Content Options

Option          | Default | Description
:---            | :---    | :---
**scroll**      | `true`  | Remember scroll position
**toc**         | `false` | Generate Table of Contents

Enable the `scroll` option while you are working on a markdown document and you are frequently refreshing the page. Also useful when you are reading long document and you want to continue from where you left off.

Disable the `scroll` option if you want the page rendered at the top or scrolled down to a certain header if a hash URL fragment is present.


## Advanced Options

Markdown Viewer doesn't require any specific permissions in order to render markdown files from local file URLs. For example the `file:///home/s/chrome/markdown-viewer/README.md` on my hard drive will always be rendered without a problem.

### Add Origin

In case you want the extension to render markdown files from web URLs you have to specify the server's origin. The origin consists of `protocol` and `domain`. You can choouse either `https`, `http` or a `*` for both protocols.

For example here is how you can enable the extension for the `https://raw.githubusercontent.com` origin:

![add-origin]

After that you can navigate to this [URL][syntax] and play around with the compiler options.

### Add All Origins

In case you really want to you can enable the extension for **all** origins:

![all-origins]

### Specify Path RegExp

By default the extension renders only URLs ending with a markdown file extension:

![path-regexp]

It's a really simple regular expression that matches URLs ending in `.md` or `.md#some-header`. It also uses non capturing groups `(?:)`

You can change this regular expression to whatever suits your needs. The settings are being updated as you type.

### Remove Origin

At any point click on the small `x` button next to the origin that you want to remove. This actually removes the permission itself so that the extension is no longer able to inject scripts to that origin.

Note that the Chrome's consent popup shows up only when you add the origin for the first time. In case you re-add it you'll no longer see that popup. That's a Chrome thing and it's not controllable from the extension.

### Refresh Origin

The extension synchronizes your preferences across all your devices using Google Sync. The list of your allowed origins is being synced too, but the actual permissions that you give using the Chrome's consent popup are not being synced.

In case you recently added a new origin on one of your devices you'll have to explicitly allow it on your other devices. The little refresh button next to each origin is used for that.


## Markdown Syntax

- Add the `raw.githubusercontent.com` origin through the Advanced Options
- Navigate to this [URL][syntax] and play around with the `Compiler Options`
- Use the `Markdown/HTML` button to switch between raw markdown and rendered HTML
- At any point click on the `Defaults` button to reset back the compiler options


## License

The MIT License (MIT)

Copyright (c) 2013-2017 Simeon Velichkov <simeonvelichkov@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


  [marked]: https://github.com/chjj/marked
  [showdown]: https://github.com/showdownjs/showdown
  [gfm]: https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown
  [compiler-options]: #compiler-options
  [themes0]: https://github.com/sindresorhus/github-markdown-css
  [themes1]: https://github.com/jasonm23/markdown-css-themes
  [themes2]: https://github.com/mixu/markdown-styles
  [themes3]: https://github.com/nWODT-Cobalt/markown-utilities
  [prism]: http://prismjs.com/
  [event-page]: http://developer.chrome.com/extensions/event_pages.html
  [chrome-store]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [gfm-tables]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables
  [syntax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/syntax.md
  [add-origin]: http://i.imgur.com/56zWesT.png
  [all-origins]: http://i.imgur.com/GiLeftR.png
  [path-regexp]: http://i.imgur.com/IJuNA63.png
  [file-urls]: http://i.imgur.com/eqiwzEz.png
