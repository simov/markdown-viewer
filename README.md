
# Markdown Viewer / Chrome Extension


## [Install][chrome-store]


## Features

- No special permissions required for file URLs
- Full control over the allowed origins
- Supports multiple markdown parsers
- Full control over the [compiler options][compiler-options] ([marked][marked] or [remark][remark])
- Themes support (including [GitHub theme][themes0]) ([jasonm23][themes1], [mixu][themes2], [cobalt][themes3])
- Supports [GitHub Flavored Markdown][gfm]
- Syntax highlighted code blocks ([prism][prism])
- Generates Table of Contents (TOC)
- Remembers scroll position
- Emoji support (Icons provided free by [EmojiOne][emojione])
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
**breaks**      | `false` | Enable GFM [line breaks][gfm]. This option requires the gfm option to be true.
**gfm**         | `true`  | Enable GFM [GitHub Flavored Markdown][gfm].
**pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
**sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.
**smartLists**  | `false` | Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
**smartypants** | `false` | Use "smart" typographic punctuation for things like quotes and dashes.
**tables**      | `true`  | Enable GFM [tables][gfm-tables]. This option requires the gfm option to be true.

### Remark

Option          | Default | Description
:---            | :---    | :---
**breaks**      | `false` | Enable GFM [line breaks][gfm]. This option requires the gfm option to be true.
**commonmark**  | `false` | Toggle CommonMark mode.
**footnotes**   | `false` | Toggle reference footnotes and inline footnotes.
**gfm**         | `true`  | Enable GFM [GitHub Flavored Markdown][gfm].
**pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
**sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.
**yaml**        | `true`  | Enables raw YAML front matter to be detected at the top.


## Content Options

Option          | Default | Description
:---            | :---    | :---
**emoji**       | `false` | Convert emoji :shortnames: into EmojiOne images
**scroll**      | `true`  | Remember scroll position
**toc**         | `false` | Generate Table of Contents

Enable the `scroll` option while you are working on a markdown document and you are frequently refreshing the page. Also useful when you are reading long document and you want to continue from where you left off.

Disable the `scroll` option if you want the page rendered at the top or scrolled down to a certain header if a hash URL fragment is present.


## Advanced Options

Markdown Viewer doesn't require any specific permissions in order to render markdown files from local file URLs. For example the `file:///home/s/chrome/markdown-viewer/README.md` on my hard drive will always be rendered as long as the `Allow access to file URLs` is enabled for the extension.

### Add Origin

In case you want the extension to render markdown files from web URLs you have to specify the server's origin. The origin consists of `protocol` and `domain`. You can choose either `https`, `http` or a `*` for both protocols.

Here is how you can enable the extension for the `https://raw.githubusercontent.com` origin:

![add-origin]

Then you can navigate to this [URL][syntax] and play around with the compiler options.

### Add All Origins

In case you really want to you can enable the extension for **all** origins:

![all-origins]

### Path Matching

By default the extension renders only URLs ending with a markdown file extension:

![path-regexp]

It's a really simple regular expression that matches URLs ending in `.md` or `.md#some-header`. It also uses non capturing groups `(?:)`

You can modify this regular expression to whatever suits your needs. The settings are being updated as you type.

### Remove Origin

At any point click on the small `x` button next to the origin that you want to remove. This actually removes the permission itself so that the extension is no longer able to inject scripts into that origin.

Note that the Chrome's consent popup shows up only when you add the origin for the first time. In case you re-add it you'll no longer see that popup. That's a Chrome thing and it's not controllable through the extension.

### Refresh Origin

The extension synchronizes your preferences across all your devices using Google Sync. The list of your allowed origins is being synced too, but the actual permissions that you give using the Chrome's consent popup are not being synced.

In case you recently added a new origin on one of your devices you'll have to explicitly allow it on your other devices. The little refresh button next to each origin is used for that.


## Markdown Syntax

- Add the `raw.githubusercontent.com` origin through the Advanced Options
- Navigate to this [URL][syntax] and play around with the `Compiler Options`
- Use the `Markdown/HTML` button to switch between raw markdown and rendered HTML
- At any point click on the `Defaults` button to reset back the compiler options


## More Compilers

Markdown Viewer can be used with any markdown parser/compiler. Currently the following compilers are implemented: [marked], [remark], [showdown], [markdown-it], [remarkable], [commonmark], [markdown-js].

1. Clone the [compilers][compilers] branch
2. Navigate to `chrome://extensions`
3. Make sure that the `Developer mode` checkbox is checked at the top
4. Disable the Markdown Viewer extension downloaded from the Chrome Store
5. Click on the `Load unpacked extension...` button and select the cloned directory

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


  [chrome-store]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk

  [marked]: https://github.com/chjj/marked
  [remark]: https://github.com/wooorm/remark
  [showdown]: https://github.com/showdownjs/showdown
  [markdown-it]: https://github.com/markdown-it/markdown-it
  [remarkable]: https://github.com/jonschlinkert/remarkable
  [commonmark]: https://github.com/jgm/commonmark.js
  [markdown-js]: https://github.com/evilstreak/markdown-js

  [emojione]: https://emojione.com

  [gfm]: https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown
  [compiler-options]: #compiler-options
  [themes0]: https://github.com/sindresorhus/github-markdown-css
  [themes1]: https://github.com/jasonm23/markdown-css-themes
  [themes2]: https://github.com/mixu/markdown-styles
  [themes3]: https://github.com/nWODT-Cobalt/markown-utilities
  [prism]: http://prismjs.com/
  [gfm-tables]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables
  [syntax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/syntax.md
  [compilers]: https://github.com/simov/markdown-viewer/tree/compilers

  [file-urls]: http://i.imgur.com/eqiwzEz.png
  [add-origin]: http://i.imgur.com/56zWesT.png
  [all-origins]: http://i.imgur.com/GiLeftR.png
  [path-regexp]: http://i.imgur.com/IJuNA63.png
