
# Markdown Viewer / Chrome Extension


## [Install][chrome-store]


## Features

- Built on top of the [marked][marked] compiler
- Support for [GitHub Flavored Markdown][gfm]
- Full control over the [compiler options][compiler-options]
- Themes from [jasonm23][themes1], [mixu][themes2] and [cobalt][themes3]
- Syntax highlighted code blocks using [prism][prism]
- Settings synchronization through google sync
- Supports raw and rendered markdown views
- Supported file extensions `markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text`
- Built as [event page][event-page] - the extension is loaded only when needed
- No special permissions required for file URLs
- Full control over the allowed origins
- Open source


## Compiler Options

Option          | Default | Description
:---            | :---    | :---
**gfm**         | `true`  | Enable GFM [GitHub Flavored Markdown][gfm].
**tables**      | `true`  | Enable GFM [tables][gfm-tables]. This option requires the gfm option to be true.
**breaks**      | `false` | Enable GFM [line breaks][gfm]. This option requires the gfm option to be true.
**pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
**sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.
**smartLists**  | `false` | Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
**smartypants** | `false` | Use "smart" typograhic punctuation for things like quotes and dashes.


## Local Files

To enable the extensions for local files:

1. Navigate to `chrome://extensions`
2. Make sure that the `Allow access to file URLs` checkbox is checked for the `Markdown Viewer` extension


## Remote Files

1. Click on the Markdown Viewer icon and select `Options`
2. Add the origin that you want enabled for the Markdown Viewer extension


## Advanced Options

![advanced-options]

Markdown Viewer doesn't require any specific permissions in order to render markdown files from local file URLs. For example the `file:///home/s/chrome/markdown-viewer/README.md` on my hard drive will always be rendered without a problem.

1. In case you want the extension to render markdown files from web URLs you have to specify the server's origin. The origin consists of `[protocol]://[domain]` For example adding `https://raw.githubusercontent.com` will allow the extension to render markdown files from that origin.

2. By default the extension renders only URLs ending with a markdown file extension. For example if you add the `https://raw.githubusercontent.com` origin, then the `https://raw.githubusercontent.com/simov/markdown-viewer/master/README.md` URL will be rendered as markdown file.

3. At any point you can remove the allowed origin.

4. In case a custom path matching is needed, for example `https://something.com/some-path` then after adding the `http://something.com` origin you'll have to set the path matching regular expression as well `\/some-path$`.

5. Markdown Viewer synchronizes your preferences across multiple devices so your list of allowed origins is always up to date. However the actual permissions are not being synced automatically. In case you recently added a new origin on one of your computers you'll have to allow it on your other computers as well. Just click on the `Refresh` icon to add the same permission on the computer you are currently on.

6. Markdown Viewer is an Open Source project hosted on GitHub. In case you have any problems with it, questions or other suggestions open up an issue there `https://github.com/simov/markdown-viewer/issues`.


## Markdown Syntax

- Navigate to this [URL][syntax] and play around with the `Compiler Options`
- Use the `Markdown/HTML` button to switch between raw markdown and rendered HTML
- At any point click on the `Defaults` button to reset back the compiler's options


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
  [gfm]: https://help.github.com/articles/github-flavored-markdown
  [compiler-options]: https://github.com/chjj/marked#gfm
  [themes1]: https://github.com/jasonm23/markdown-css-themes
  [themes2]: https://github.com/mixu/markdown-styles
  [themes3]: https://github.com/nWODT-Cobalt/markown-utilities
  [prism]: http://prismjs.com/
  [event-page]: http://developer.chrome.com/extensions/event_pages.html
  [chrome-store]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [gfm-tables]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables
  [syntax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/syntax.md
  [advanced-options]: https://raw.githubusercontent.com/simov/markdown-viewer/master/images/advanced-options.png
