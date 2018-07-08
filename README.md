
# Markdown Viewer / Browser Extension

**Install: [Chrome]** / **[Firefox]** / **[Opera]** / **Donate: [PayPal]**


# Features

- Renders local and remote URLs
- Granular access to remote origins
- Multiple markdown parsers
- Full control over the [compiler options](#compiler-options) ([marked][marked] or [remark][remark])
- Themes (including [GitHub theme][themes0]) ([jasonm23][themes1], [mixu][themes2], [cobalt][themes3])
- [GitHub Flavored Markdown][gfm] (GFM)
- Auto reload on file change
- Syntax highlighted code blocks ([prism][prism])
- Table of Contents (TOC)
- [MathJax][mathjax] support
- Emoji support (Icons provided free by [EmojiOne][emojione])
- Remembers scroll position
- Markdown Content-Type detection
- URL detection using RegExp
- Toggle Content Security Policy (CSP)
- Override page encoding
- Settings synchronization
- Raw and rendered markdown views
- Built as [event page][event-page]
- Free and Open Source


# Table of Contents

- **[After Install](#after-install)**
  - [Local Files](#local-files) / [Remote Files](#remote-files)
- **[Compiler Options](#compiler-options)**
  - [Marked](#marked) / [Remark](#remark)
- **[Content Options](#content-options)**
  - [Autoreload](#autoreload) / [TOC](#toc) / [MathJax](#mathjax) / [Emoji](#emoji) / [Scroll](#scroll)
- **[Advanced Options](#advanced-options)**
  - [Add Origin](#add-origin) / [Allow All Origins](#allow-all-origins)
  - [Header Detection](#header-detection) / [Path Matching](#path-matching) / [Path Matching Priority](#path-matching-priority)
  - [Remove Origin](#remove-origin) / [Refresh Origin](#refresh-origin)
  - [Disable CSP](#disable-content-security-policy) / [Character Encoding](#character-encoding)
- **[Markdown Syntax and Features](#markdown-syntax-and-features)**
- **[More Compilers](#more-compilers)**


# After Install

## Local Files

1. Navigate to `chrome://extensions`
2. Locate Markdown Viewer and click on the `DETAILS` button
3. Make sure that the `Allow access to file URLs` switch is turned on

![file-urls]

> Navigate to `file:///` in your browser and locate the markdown files that you want to read


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
**autoreload**  | `false` | Auto reload on file change
**toc**         | `false` | Generate Table of Contents
**mathjax**     | `false` | Render TeX and LaTeX math blocks
**emoji**       | `false` | Convert emoji :shortnames: into EmojiOne images
**scroll**      | `true`  | Remember scroll position


## Autoreload

When enabled the extension will make a GET request every second to:

- `file://` URLs
- any host that resolves to localhost IPv4 `127.0.0.1` or IPv6 `::1`


## TOC

- Generates Table of Contents (TOC) based on the headers found in the markdown document.


## MathJax

The following `mathjax` delimiters are supported:

- inline math: `\(math\)` and `$math$`
- display math: `\[math\]` and `$$math$$`

The following rules apply to your content when `mathjax` is enabled:

- Regular dollar sign `$` in text that is not part of a math formula should be escaped: `\$`
- Regular markdown escaping for parentheses: `\(` and `\)`, and brackets: `\[` and `\]` is not supported. MathJax will convert anything between these delimiters to math formulas, unless they are wrapped in backticks: `` `\(` `` or fenced code blocks.

> The MathJax support currently works only on local file URLs and remote origins without strict *Content Security Policy (CSP)* set. For example it won't work for files hosted on the GitHub's `raw.githubusercontent.com` origin. However you can bypass this by enabling the [Disable CSP](#disable-content-security-policy) switch for that origin.


## Emoji

- Emoji shortnames like: `:sparkles:` will be converted to :sparkles: using [EmojiOne][emojione] images.
- Currently unicode symbols like `✨` and ASCII emoji like `:D` are not supported.

> The Emoji support currently works only on local file URLs and remote origins without strict *Content Security Policy (CSP)* set. For example it won't work for files hosted on the GitHub's `raw.githubusercontent.com` origin. However you can bypass this by enabling the [Disable CSP](#disable-content-security-policy) switch for that origin.


## Scroll

- When enabled, the `scroll` option remembers the current scroll position and scrolls back to it after page load.
- When disabled, the `scroll` option either scrolls to the top of the document or to a certain header (anchor) if a hash URL fragment is present.


# Advanced Options

Detecting and rendering [local file URLs](#local-files) can be enabled by using the `Allow access to file URLs` option for the extension.

Access to remote URLs however, needs to be enabled manually.


## Add Origin

Here is how you can enable the extension for the `https://raw.githubusercontent.com` origin:

![add-origin]

The origin consists of *protocol* part and *domain* part. The *protocol* can be either `https`, `http`, or a `*` to match both `https` and `http`.


## Allow All Origins

In case you really want to you can enable the extension for **all** origins:

![all-origins]

Alternatively you can use the `Allow All` button.

> **Note:** Take a look at the [Path Matching Priority](#path-matching-priority) section below to see how the Markdown content is being included for or excluded from rendering!


## Header Detection

When this option is enabled the extension will check for the presence of the `text/markdown` and `text/x-markdown` *content-type* header before trying to match the path:

![header-detection]


## Path Matching

If the header detection is disabled or a proper *content-type* header is missing, the extension will check if the URL is ending with a markdown file extension.

The default regular expression is: `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

It's a simple regular expression that matches URLs ending with:

- markdown file extension: `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)`
- and optionally anchor or querystring after that: `(?:#.*|\?.*)?`

> The `?:` used in `(?:match)` stands for *non-capturing group* and it's there for performance reasons.

You can modify the path matching regular expression for each enabled origin individually. The settings are being updated as you type.


## Path Matching Priority

The enabled origins are matched from most specific to least specific:

1. `https://raw.githubusercontent.com` or `http://raw.githubusercontent.com`
2. `*://raw.githubusercontent.com`
3. `*://*`

Only the first matching origin is picked and then its Path Matching RegExp is used to match the entire URL. If it fails no other attempts are made to match the URL.

### Custom Path

- __`*://website.com`__ - `\/some\/custom\/path\/to\/serve\/markdown\/$`
- __`*://*`__ - `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

In this example we have allowed all origins (the last entry). It uses the default Path Matching RegExp that is going to match only URLs ending with markdown file extension.

In case we want to match a custom path we have to add a more specific origin and specify its Path Matching RegExp accordingly.

### Exclude Origin

- __`*://github.com`__ - `something impossible to match !!!`
- __`*://*`__ - `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

In this example we have allowed all origins (the last entry). It uses the default Path Matching RegExp that is going to match only URLs ending with markdown file extension.

The problem is that some origins may serve rendered HTML content on URLs ending with markdown file extension.

GitHub:
- https://github.com/simov/markdown-syntax/blob/master/README.md - *HTML*
- https://raw.githubusercontent.com/simov/markdown-syntax/master/README.md - *Markdown*

In this case we want to exclude the `github.com` origin altogether and for that we have to add more specific origin and set its Path Matching RegExp to something that's impossible to match.

### Exclude Path

- __`*://bitbucket.org`__ - `.*\/raw\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`
- __`*://gitlab.com`__ - `.*\/raw\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`
- __`*://*`__ - `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

In this example we have allowed all origins (the last entry). It uses the default Path Matching RegExp that is going to match only URLs ending with markdown file extension.

The problem is that some origins may serve rendered HTML content on URLs ending with markdown file extension.

BitBucket:
- https://bitbucket.org/simovelichkov/markdown-syntax/src/master/README.md - *HTML*
- https://bitbucket.org/simovelichkov/markdown-syntax/raw/master/README.md - *Markdown*

GitLab:
- https://gitlab.com/simovelichkov/markdown-syntax/blob/master/README.md - *HTML*
- https://gitlab.com/simovelichkov/markdown-syntax/raw/master/README.md - *Markdown*

In this case we want to match only URLs containing the `raw` word in their path and for that we have to add more specific origins and set their Path Matching RegExp accordingly.


## Remove Origin

At any point click on the `REMOVE` button for the origin that you want to remove. This actually removes the permission itself so that the extension is no longer able to inject code into that origin.

Note that the Chrome's consent popup shows up only when you add the origin for the first time. In case you re-add it you'll no longer see that popup. That's a Chrome thing and it's not controllable through the extension.


## Refresh Origin

The extension synchronizes your preferences across all of your devices using Google Sync. The list of your allowed origins is being synced too. However, the actual permissions that you give using the Chrome's consent popup cannot be synced.

In case you've recently added a new origin on one of your devices you'll have to explicitly allow it on your other devices. In this case additional **`refresh`** label will be present for each origin that needs to be _refreshed_. This label is present **only** on those devices that needs to be _refreshed_. Expanding the origin will reveal additional `REFRESH` button:

![refresh-origin]


## Disable Content Security Policy

Some remote origins may serve its content with a `content-security-policy` header set that prevents the extension from executing certain JavaScript code inside the content of that page. For example on `raw.githubusercontent.com` certain things such as remembering your scroll position, generating TOC, displaying MathJax or Emojis won't work.

Using the `Disable Content Security Policy` switch you can optionally tell the extension to strip that header from the incoming request and therefore allow its full functionality to work:

![disable-csp]

Note that the Content Security Policy header will be stripped **only** if the URL matches the corresponding [Path Matching RegExp](#path-matching) for that origin.

Even if you have [Allowed All Origins](#allow-all-origins) and disabled the Content Security Policy at the same time, the header will be stripped **only** for those requests with URL that matches your explicitly set [Path Matching RegExp](#path-matching) for the Allow All origin `*://*`


## Character Encoding

By default Markdown Viewer uses the browser's built-in encoding detection. In case you want to force certain Character Encoding for a specific origin - use the Encoding select control.

The Character Encoding set for origin is used only when the markdown content is served with explicit `Content-Type` header and explicit `charset`. In all other cases Chrome picks the correct encoding by default.

In Firefox the character encoding is set always when enabled.


# Markdown Syntax and Features

A separate repository containing examples about: markdown syntax, syntax highlighting in code blocks, mathjax etc. is hosted on all major Git hosting providers: [GitHub][syntax-github], [GitLab][syntax-gitlab], [BitBucket][syntax-bitbucket].

Allow the appropriate origin to render the raw markdown files directly on: [GitHub][syntax-raw-github], [GitLab][syntax-raw-gitlab], [BitBucket][syntax-raw-bitbucket], or pull any of these repositories locally and play around with the extension's options.


# More Compilers

Markdown Viewer can be used with any markdown parser/compiler. Currently the following compilers are implemented: [marked], [remark], [showdown], [markdown-it], [remarkable], [commonmark], [markdown-js].

1. Clone the [compilers][compilers] branch
2. Follow the [Manual Install](#manual-install) steps

<!-- 2. Navigate to `chrome://extensions`
3. Make sure that the `Developer mode` checkbox is checked at the top
4. Disable the Markdown Viewer extension downloaded from the Chrome Store
5. Click on the `Load unpacked extension...` button and select the cloned directory -->


# Manual Install

## Chrome / Opera

1. Clone this repository
2. Navigate to `chrome://extensions`
3. Make sure that the `Developer mode` checkbox is checked at the top
4. Disable the Markdown Viewer extension downloaded from the Chrome Store
5. Click on the `Load unpacked extension...` button and select the cloned directory

> Note that in this case you won't receive any future updates automatically.


## Firefox

1. Clone this repository
2. Rename `manifest.json` to `manifest.chrome.json`, then rename `manifest.firefox.json` to `manifest.json`
3. Navigate to `about:addons` and disable the Markdown Viewer extension downloaded from Firefox Store
4. Navigate to `about:debugging#addons`
5. Click on the `Load Temporary Add-on...` button and select the cloned directory

> Note that in this case you won't receive any future updates automatically.


# Opera

You can use the [Opera's official browser extension][opera-extensions] for installing Chrome extensions from Google Chrome Web Store to install Markdown Viewer.

Alternatively you can [install it manually](#manual-install).


# License

The MIT License (MIT)

Copyright (c) 2013-present, Simeon Velichkov <simeonvelichkov@gmail.com> (https://github.com/simov/markdown-viewer)

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


  [chrome]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [firefox]: https://addons.mozilla.org/en-US/firefox/addon/markdown-viewer-chrome/
  [opera]: #opera
  [paypal]: https://www.paypal.me/simeonvelichkov
  [donate]: https://img.shields.io/badge/paypal-donate-blue.svg?style=flat-square (Donate on Paypal)

  [marked]: https://github.com/markedjs/marked
  [remark]: https://github.com/remarkjs/remark
  [showdown]: https://github.com/showdownjs/showdown
  [markdown-it]: https://github.com/markdown-it/markdown-it
  [remarkable]: https://github.com/jonschlinkert/remarkable
  [commonmark]: https://github.com/commonmark/commonmark.js
  [markdown-js]: https://github.com/evilstreak/markdown-js

  [emojione]: https://emojione.com
  [mathjax]: https://www.mathjax.org
  [gfm]: https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown
  [themes0]: https://github.com/sindresorhus/github-markdown-css
  [themes1]: https://github.com/jasonm23/markdown-css-themes
  [themes2]: https://github.com/mixu/markdown-styles
  [themes3]: https://github.com/nWODT-Cobalt/markown-utilities
  [prism]: https://prismjs.com/
  [gfm-tables]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables
  [compilers]: https://github.com/simov/markdown-viewer/tree/compilers
  [event-page]: https://developer.chrome.com/extensions/background_pages
  [opera-extensions]: https://addons.opera.com/en/extensions/details/install-chrome-extensions/

  [syntax-github]: https://github.com/simov/markdown-syntax
  [syntax-raw-github]: https://raw.githubusercontent.com/simov/markdown-syntax/master/README.md
  [syntax-gitlab]: https://gitlab.com/simovelichkov/markdown-syntax
  [syntax-raw-gitlab]: https://gitlab.com/simovelichkov/markdown-syntax/raw/master/README.md
  [syntax-bitbucket]: https://bitbucket.org/simovelichkov/markdown-syntax
  [syntax-raw-bitbucket]: https://bitbucket.org/simovelichkov/markdown-syntax/raw/master/README.md

  [file-urls]: https://i.imgur.com/BTmlNnX.png
  [add-origin]: https://i.imgur.com/GnKmkRG.png
  [all-origins]: https://i.imgur.com/4GH3EuP.png
  [header-detection]: https://i.imgur.com/bdz3Reg.png
  [disable-csp]: https://i.imgur.com/3Qbez1l.png
  [refresh-origin]: https://i.imgur.com/UYSgelE.png
