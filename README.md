
# Markdown Viewer / Chrome Extension

**Available at [Chrome Store][chrome-store]**


# Features

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
- [MathJax][mathjax] support
- Settings synchronization
- Raw and rendered markdown views
- Open source


# Table of Contents

- **[After Install](#after-install)**
  - [Local Files](#local-files)
  - [Remote Files](#remote-files)
- [Compiler Options](#compiler-options)
  - [Marked](#marked)
  - [Remark](#remark)
- [Content Options](#content-options)
  - [Scroll](#scroll)
  - [TOC](#toc)
  - [MathJax](#mathjax)
  - [Emoji](#emoji)
- [Advanced Options](#advanced-options)
  - [Add Origin](#add-origin)
  - [Add All Origins](#add-all-origins)
  - [Header Detection](#header-detection)
  - [Path Matching](#path-matching)
  - [Remove Origin](#remove-origin)
  - [Refresh Origin](#refresh-origin)
- [Markdown Syntax and Features](#markdown-syntax-and-features)
- [More Compilers](#more-compilers)


# After Install

## Local Files

1. Navigate to `chrome://extensions`
2. Make sure that the `Allow access to file URLs` checkbox is checked for the Markdown Viewer extension

![file-urls]


## Remote Files

1. Click on the Markdown Viewer icon and select [Advanced Options](#advanced-options)
2. Add the origins that you want enabled for the Markdown Viewer extension


# Compiler Options

## Marked

Option          | Default | Description
:---            | :---    | :---
**breaks**      | `false` | Enable GFM [line breaks][gfm]. This option requires the gfm option to be true.
**gfm**         | `true`  | Enable GFM [GitHub Flavored Markdown][gfm].
**pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
**sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.
**smartLists**  | `false` | Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
**smartypants** | `false` | Use "smart" typographic punctuation for things like quotes and dashes.
**tables**      | `true`  | Enable GFM [tables][gfm-tables]. This option requires the gfm option to be true.

## Remark

Option          | Default | Description
:---            | :---    | :---
**breaks**      | `false` | Enable GFM [line breaks][gfm]. This option requires the gfm option to be true.
**commonmark**  | `false` | Toggle CommonMark mode.
**footnotes**   | `false` | Toggle reference footnotes and inline footnotes.
**gfm**         | `true`  | Enable GFM [GitHub Flavored Markdown][gfm].
**pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
**sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.


# Content Options

Option          | Default | Description
:---            | :---    | :---
**emoji**       | `false` | Convert emoji :shortnames: into EmojiOne images
**scroll**      | `true`  | Remember scroll position
**toc**         | `false` | Generate Table of Contents
**mathjax**     | `false` | Render TeX and LaTeX math blocks

## Scroll

- Enable the `scroll` option while you are working on a markdown document and you are frequently refreshing the page. Also useful when you are reading long document and you want to continue from where you left off.
- Disable the `scroll` option if you want the page rendered at the top or scrolled down to a certain header if a hash URL fragment is present.

## TOC

- Generates Table of Contents (TOC) based on the headers found in the markdown document.

## MathJax

The following `mathjax` delimiters are supported:

- inline math: `\(math\)` and `$math$`
- display math: `\[math\]` and `$$math$$`

The following rules apply to your content when `mathjax` is enabled:

- Regular dollar sign `$` in text that is not part of a math formula should be escaped: `\$`
- Regular markdown escaping for parentheses: `\(` and `\)`, and brackets: `\[` and `\]` is not supported. MathJax will convert anything between these delimiters to math formulas, unless they are wrapped in backticks: `` `\(` `` or fenced code blocks.

## Emoji

- Emoji shortnames like: `:sparkles:` will be converted to :sparkles: using [EmojiOne][emojione] images.
- Currently unicode symbols like `✨` and ASCII emoji like `:D` are not supported.


# Advanced Options

Detecting and rendering [local file URLs](#local-files) can be enabled easily using the `Allow access to file URLs` option for the extension.

Access to remote URLs however, should be enabled manually.


## Add Origin

Here is how you can enable the extension for the `https://raw.githubusercontent.com` origin:

![add-origin]

The origin consists of *protocol* part and *domain* part. The *protocol* can be either `https`, `http`, or a `*` to match both `https` and `http`.

Enable the above origin and play around with the extension [here][syntax].

> Note that the remote origins should either provide a valid HTTP header (see [Header Detection](#header-detection)) and/or valid URL path (see [Path Matching](#path-matching)). Otherwise you'll have to add the origin explicitly and modify its [Path Matching](#path-matching) regular expression.

## Add All Origins

In case you really want to you can enable the extension for **all** origins:

![all-origins]

Alternatively you can use the `Allow All` button.

## Header Detection

When this option is enabled the extension will check for the `text/markdown` and `text/x-markdown` *content-type* header before trying to match the path:

![header-detection]

## Path Matching

If the header detection is disabled or a proper *content-type* header is missing, the extension will check if the URL is ending with a markdown file extension:

![path-regexp]

It's a simple regular expression that matches URLs ending with:

- markdown file extension: `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)`
- and optionally anchor or querystring after that: `(?:#.*|\?.*)?`

> The `?:` used in `(?:match)` stands for *non-capturing group* and it's there for performance reasons.

You can modify the path matching regular expression for each enabled origin individually. The settings are being updated as you type.

## Remove Origin

At any point click on the small `x` button next to the origin that you want to remove. This actually removes the permission itself so that the extension is no longer able to inject scripts into that origin.

Note that the Chrome's consent popup shows up only when you add the origin for the first time. In case you re-add it you'll no longer see that popup. That's a Chrome thing and it's not controllable through the extension.

## Refresh Origin

The extension synchronizes your preferences across all your devices using Google Sync. The list of your allowed origins is being synced too, but the actual permissions that you give using the Chrome's consent popup cannot be synced.

In case you recently added a new origin on one of your devices you'll have to explicitly allow it on your other devices. The little refresh button next to each origin is used for that.


# Markdown Syntax and Features

A few files located in the [test] folder of this repo can be used to test what's possible with Markdown Viewer:

- Add the `raw.githubusercontent.com` origin through the [Advanced Options](#advanced-options)
- Navigate to the test files: [syntax][test-syntax], [mathjax][test-mathjax], [yaml][test-yaml], [toml][test-toml] and play around with the `Compiler` and `Content` options
- Use the `Markdown/HTML` button to switch between raw markdown and rendered HTML
- At any point click on the `Defaults` button to reset back the compiler options


# More Compilers

Markdown Viewer can be used with any markdown parser/compiler. Currently the following compilers are implemented: [marked], [remark], [showdown], [markdown-it], [remarkable], [commonmark], [markdown-js].

1. Clone the [compilers][compilers] branch
2. Navigate to `chrome://extensions`
3. Make sure that the `Developer mode` checkbox is checked at the top
4. Disable the Markdown Viewer extension downloaded from the Chrome Store
5. Click on the `Load unpacked extension...` button and select the cloned directory

# License

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
  [mathjax]: https://www.mathjax.org

  [gfm]: https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown
  [compiler-options]: #compiler-options
  [themes0]: https://github.com/sindresorhus/github-markdown-css
  [themes1]: https://github.com/jasonm23/markdown-css-themes
  [themes2]: https://github.com/mixu/markdown-styles
  [themes3]: https://github.com/nWODT-Cobalt/markown-utilities
  [prism]: http://prismjs.com/
  [gfm-tables]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables
  [syntax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/syntax.md
  [compilers]: https://github.com/simov/markdown-viewer/tree/compilers
  [test]: https://github.com/simov/markdown-viewer/tree/master/test

  [test-syntax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/syntax.md
  [test-mathjax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/mathjax.md
  [test-yaml]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/yaml.md
  [test-toml]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/toml.md

  [file-urls]: https://i.imgur.com/eqiwzEz.png
  [add-origin]: https://i.imgur.com/56zWesT.png
  [all-origins]: https://i.imgur.com/GiLeftR.png
  [header-detection]: https://i.imgur.com/EYdmbSd.png
  [path-regexp]: https://i.imgur.com/e06U6J2.png
