
# Markdown Viewer / Chrome Extension


## [Install][9]


## Features

- Built on top of the [marked][1] compiler
- Support for [GitHub Flavored Markdown][2]
- Full control over the [compiler options][3]
- 20 themes from [jasonm23][4] and [mixu][5]
- Syntax highlighted code blocks using [prism][6]
- Settings synchronization through google sync
- Quickly switch between raw markdown and html
- Supported file extensions `markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text`
- Built as [event page][7] - the extension is loaded only when it's needed
- [Open source][8]


## After Install

To enable the extensions for local files:
1. Navigate to `chrome://extensions`
2. Make sure that the `Allow access to file URLs` checkbox is checked for the `Markdown Viewer` extension

To enable HTML tag rendering:
1. Click on the small `m` icon in the right side of your browser's address bar
2. Under the `Compiler Options` make sure the `sanitize` option is unchecked


## Compiler Options

Option          | Default | Description
:---            | :---    | :---
**breaks**      | `false` | Enable GFM [line breaks][2]. This option requires the gfm option to be true.
**gfm**         | `true`  | Enable [GitHub flavored markdown][2].
**pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
**sanitize**    | `true`  | Sanitize the output. Ignore any HTML that has been input.
**smartLists**  | `true`  | Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
**smartypants** | `false` | Use "smart" typograhic punctuation for things like quotes and dashes.
**tables**      | `true`  | Enable GFM [tables][10]. This option requires the gfm option to be true.


## License

The MIT License (MIT)

Copyright (c) 2013-2016 Simeon Velichkov <simeonvelichkov@gmail.com>

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


  [1]: https://github.com/chjj/marked
  [2]: https://help.github.com/articles/github-flavored-markdown
  [3]: https://github.com/chjj/marked#gfm
  [4]: https://github.com/jasonm23/markdown-css-themes
  [5]: https://github.com/mixu/markdown-styles
  [6]: http://prismjs.com/
  [7]: http://developer.chrome.com/extensions/event_pages.html
  [8]: https://github.com/simov/markdown-viewer
  [9]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [10]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables
