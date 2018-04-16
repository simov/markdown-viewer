
# Markdown Viewer / Browser Extension

**Install: [Chrome][chrome-store]** / **[Firefox][amo]** / **Donate: [PayPal][paypal]**


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
- Detects markdown by header and path
- Toggle Content Security Policy
- Override page encoding
- Built as [event page][event-page]
- Free and Open Source


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
  - [Allow All Origins](#allow-all-origins)
  - [Header Detection](#header-detection)
  - [Path Matching](#path-matching)
  - [Path Matching Priority](#path-matching-priority)
  - [Remove Origin](#remove-origin)
  - [Refresh Origin](#refresh-origin)
  - [Disable CSP](#disable-content-security-policy)
  - [Character Encoding](#character-encoding)
- [Markdown Syntax and Features](#markdown-syntax-and-features)
- [More Compilers](#more-compilers)


# After Install

## Local Files

1. Navigate to `chrome://extensions`
2. Make sure that the `Allow access to file URLs` checkbox is checked for the Markdown Viewer extension

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
**emoji**       | `false` | Convert emoji :shortnames: into EmojiOne images
**scroll**      | `true`  | Remember scroll position
**toc**         | `false` | Generate Table of Contents
**mathjax**     | `false` | Render TeX and LaTeX math blocks


## Scroll

- When enabled, the `scroll` option remembers the current scroll position and scrolls back to it after page load.
- When disabled, the `scroll` option either scrolls to the top of the document or to a certain header (anchor) if a hash URL fragment is present.


## TOC

- Generates Table of Contents (TOC) based on the headers found in the markdown document.


## MathJax

The following `mathjax` delimiters are supported:

- inline math: `\(math\)` and `$math$`
- display math: `\[math\]` and `$$math$$`

The following rules apply to your content when `mathjax` is enabled:

- Regular dollar sign `$` in text that is not part of a math formula should be escaped: `\$`
- Regular markdown escaping for parentheses: `\(` and `\)`, and brackets: `\[` and `\]` is not supported. MathJax will convert anything between these delimiters to math formulas, unless they are wrapped in backticks: `` `\(` `` or fenced code blocks.

> The MathJax support currently works only on local file URLs and remote origins without strict *Content Security Policy (CSP)* set. For example it won't work for files hosted on the GitHub's `raw.githubusercontent.com` origin. However you can bypass this by enabling the [Disable CSP](#disable-content-security-policy) option.


## Emoji

- Emoji shortnames like: `:sparkles:` will be converted to :sparkles: using [EmojiOne][emojione] images.
- Currently unicode symbols like `✨` and ASCII emoji like `:D` are not supported.

> The Emoji support currently works only on local file URLs and remote origins without strict *Content Security Policy (CSP)* set. For example it won't work for files hosted on the GitHub's `raw.githubusercontent.com` origin. However you can bypass this by enabling the [Disable CSP](#disable-content-security-policy) option.


# Advanced Options

Detecting and rendering [local file URLs](#local-files) can be enabled by using the `Allow access to file URLs` option for the extension.

Access to remote URLs however, needs to be enabled manually.


## Add Origin

Here is how you can enable the extension for the `https://raw.githubusercontent.com` origin:

![add-origin]

The origin consists of *protocol* part and *domain* part. The *protocol* can be either `https`, `http`, or a `*` to match both `https` and `http`.

Enable the above origin and play around with the extension options [here][syntax].


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

For example let's assume that we have the following origins enabled with their respective Path Matching RegExp set as follows:

Origin               | Match
:---                 | :---
__`*://*`__          | `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`
__`*://asite.com`__  | `\/some\/custom\/path\/to\/serve\/markdown\/$`
__`*://github.com`__ | `something impossible to match`
__`*://gitlab.com`__ | `.*\/raw\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

1. In this example we have allowed all origins `*://*` (the first entry) with the default Path Matching RegExp, meaning that all origins are going to match **only** on those URLs ending with markdown file extension.<br>
For example this is going to match: https://raw.githubusercontent.com/simov/markdown-viewer/master/README.md<br>
However it's important to note that the `*://*` (Allow All) origin serves as a **fallback**. Its Path Matching RegExp will be used only if any other explicitly added (more specific) origins fail to match, meaning that all other explicitly added origins **override** the `*://*` (Allow All) origin and therefore its Path Matching RegExp!

2. For example let's assume that our imaginary origin `asite.com` (the second entry) serves markdown files on a custom path: `https://asite.com/some/custom/path/to/serve/markdown/`<br>
In this case we'll have to **explicitly add** an entry for `asite.com` and modify its path matching RegExp even if the extension was enabled for all origins!

3. Now take a look at the third entry. GitHub is a good example of a website that serves rendered HTML content on URLs ending with markdown file extension.<br>
For example we would like the extension to render:<br>
https://raw.githubusercontent.com/simov/markdown-viewer/master/README.md<br>
but not:<br>
https://github.com/simov/markdown-viewer/blob/master/README.md<br>
In this case we want to **exclude** the `github.com` origin althogether. To **exclude** an origin you have to set its path matching RegExp to something that's **impossible to match**!

4. Moving on to the forth entry. What if we want to match things like:<br>
https://gitlab.com/gitlab-org/gitlab-ce/raw/master/README.md<br>
but not:<br>
https://gitlab.com/gitlab-org/gitlab-ce/blob/master/README.md<br>
Notice the subtle difference between the two URLs - the first one contains the `raw` word in its path. Now take a closer look at the table above and you'll notice that the `gitlab.com` entry have a slightly modified path matching RegExp too - it have the `.*\/raw\/.*` string prepended in front of the default RegExp that matches every path ending with markdown file extension.<br>
The result is as you might expect, the first URL:<br>
https://gitlab.com/gitlab-org/gitlab-ce/raw/master/README.md is going to be **matched** and rendered by Markdown Viewer, however the second one:<br>
https://gitlab.com/gitlab-org/gitlab-ce/blob/master/README.md will be **excluded**!


## Remove Origin

At any point click on the `REMOVE` button for the origin that you want to remove. This actually removes the permission itself so that the extension is no longer able to inject code into that origin.

Note that the Chrome's consent popup shows up only when you add the origin for the first time. In case you re-add it you'll no longer see that popup. That's a Chrome thing and it's not controllable through the extension.


## Refresh Origin

The extension synchronizes your preferences across all of your devices using Google Sync. The list of your allowed origins is being synced too. However, the actual permissions that you give using the Chrome's consent popup cannot be synced.

In case you've recently added a new origin on one of your devices you'll have to explicitly allow it on your other devices. The `REFRESH` button for each origin is used for that.


## Disable Content Security Policy

Some remote origins may serve its content with a `content-security-policy` header set that prevents the extension from executing certain JavaScript code inside the content of that page. For example on `raw.githubusercontent.com` certain things such as remembering your scroll position, generating TOC, displaying MathJax or Emojis won't work.

Using the `Disable Content Security Policy` switch you can optionally tell the extension to strip that header from the incoming request and therefore allow its full functionality to work:

![disable-csp]

It's important to note that even if you enable this option, the Content Security Policy header will be stripped **only** for those requests that either have a correct [Markdown Content Type](#header-detection) or URL that matches the corresponding [Path Matching RegExp](#path-matching) for that origin.

Even if you have [Allowed All Origins](#allow-all-origins) and disabled the Content Security Policy at the same time, the header will be stripped **only** for those requests that either have a correct [Markdown Content Type](#header-detection) or URL that matches your explicitly set [Path Matching](#path-matching) regex for the Allow All origin `*://*`.


## Character Encoding

By default Markdown Viewer uses the browser's built-in encoding detection. In case you want to force a certain Character Encoding for a specific origin - use the Encoding select control.


# Markdown Syntax and Features

A few files located in the [test] folder of this repo can be used to test what's possible with Markdown Viewer:

- Add the `raw.githubusercontent.com` origin through the [Advanced Options](#advanced-options)
- Navigate to the test files: [syntax][test-syntax], [mathjax][test-mathjax], [yaml][test-yaml], [toml][test-toml] and play around with the `Compiler` and `Content` options
- Use the `Markdown/HTML` button to switch between raw markdown and rendered HTML
- At any point click on the `Defaults` button to reset back the compiler options

> Note that in order for the extension to fully function on the `raw.githubusercontent.com` origin you have to enable the [Disable CSP](#disable-content-security-policy) option.


# More Compilers

Markdown Viewer can be used with any markdown parser/compiler. Currently the following compilers are implemented: [marked], [remark], [showdown], [markdown-it], [remarkable], [commonmark], [markdown-js].

1. Clone the [compilers][compilers] branch
2. Navigate to `chrome://extensions`
3. Make sure that the `Developer mode` checkbox is checked at the top
4. Disable the Markdown Viewer extension downloaded from the Chrome Store
5. Click on the `Load unpacked extension...` button and select the cloned directory


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


  [chrome-store]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [amo]: https://addons.mozilla.org/en-US/firefox/addon/markdown-viewer-chrome/
  [donate]: https://img.shields.io/badge/paypal-donate-blue.svg?style=flat-square (Donate on Paypal)
  [paypal]: https://www.paypal.me/simeonvelichkov

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
  [syntax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/syntax/syntax.md
  [compilers]: https://github.com/simov/markdown-viewer/tree/compilers
  [test]: https://github.com/simov/markdown-viewer/tree/master/test/syntax
  [event-page]: https://developer.chrome.com/extensions/event_pages

  [test-syntax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/syntax/syntax.md
  [test-mathjax]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/syntax/mathjax.md
  [test-yaml]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/syntax/yaml.md
  [test-toml]: https://raw.githubusercontent.com/simov/markdown-viewer/master/test/syntax/toml.md

  [file-urls]: https://i.imgur.com/rNS9ADW.png
  [add-origin]: https://i.imgur.com/GnKmkRG.png
  [all-origins]: https://i.imgur.com/4GH3EuP.png
  [header-detection]: https://i.imgur.com/bdz3Reg.png
  [disable-csp]: https://i.imgur.com/3Qbez1l.png
