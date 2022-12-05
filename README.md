
# Markdown Viewer / Browser Extension

**Install: [Chrome]** / **[Firefox]** / **[Edge]** / **[Opera]**  / **[Brave]** / **[Chromium]** / **[Vivaldi]**

# Features

- Secure by design
- Render local and remote file URLs
- Granular access to remote origins
- Multiple markdown parsers
- Full control over the compiler options ([marked][marked], [remark][remark])
- 30+ Themes ([cleanrmd], [GitHub][github-theme])
- GitHub Flavored Markdown (GFM)
- Auto reload on file change
- Syntax highlighted code blocks ([prism][prism])
- Table of Contents (ToC)
- MathJax formulas ([mathjax])
- Mermaid diagrams ([mermaid])
- Convert emoji shortnames (icons provided free by [EmojiOne][emojione])
- Remember scroll position
- Markdown Content-Type detection
- Configurable Markdown file path detection
- Settings synchronization
- Raw and rendered markdown views
- Free and Open Source

# Table of Contents

- **[After Install](#after-install)**
- **[Compiler Options](#compiler-options)**
- **[Content Options](#content-options)**
- **[Themes](#themes)**
- **[Manage Origins](#manage-origins)**
- **[Markdown Detection](#markdown-detection)**
- **[Syntax Examples](#syntax-examples)**

# After Install

## Local Files

1. Navigate to `chrome://extensions`
2. Locate the Markdown Viewer extension and click on the `Details` button
3. Make sure that the `Allow access to file URLs` switch is turned on

![img-extensions]
![img-file-access]

## Remote Files

1. Click on the Markdown Viewer icon and select [Advanced Options](#manage-origins)
2. Add the origins that you want enabled for the Markdown Viewer extension

---

# Compiler Options

Markdown Viewer can be used with any markdown parser/compiler. Currently the following compilers are supported: [marked], [remark], [showdown], [markdown-it], [remarkable], [commonmark], and officially it ships with Marked and Remark:

## Marked

| Option          | Default | Description
| :-              | :-:     | :-
| **breaks**      | `false` | Enable [GFM] line breaks. This option requires the gfm option to be true.
| **gfm**         | `true`  | Enable [GFM] GitHub Flavored Markdown.
| **pedantic**    | `false` | Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
| **sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.
| **smartypants** | `false` | Use "smart" typographic punctuation for things like quotes and dashes.

## Remark

| Option          | Default | Description
| :-              | :-:     | :-
| **breaks**      | `false` | Enable [GFM] line breaks. This option requires the gfm option to be true.
| **gfm**         | `true`  | Enable [GFM] GitHub Flavored Markdown.
| **sanitize**    | `false` | Sanitize the output. Ignore any HTML that has been input.

For any other supported compiler that you may want to use, follow the [Manual Install](#manual-install) steps.

---

# Content Options

| Option          | Default | Description
| :-              | :-:     | :-
| **autoreload**  | `false` | Auto reload on file change
| **toc**         | `false` | Generate Table of Contents
| **syntax**      | `true`  | Syntax highlighted fenced code blocks
| **mathjax**     | `false` | Render MathJax formulas
| **mermaid**     | `false` | Render Mermaid diagrams
| **emoji**       | `false` | Convert emoji :shortnames: into EmojiOne images
| **scroll**      | `true`  | Remember scroll position

## Autoreload

When enabled the extension will make a GET request every second to markdown files hosted on:

- `file:///` URLs
- any host that resolves to localhost IPv4 `127.0.0.1` or IPv6 `::1`

## Emoji

Convert emoji :shortnames: into EmojiOne images:

- Emoji shortnames like: `:sparkles:` will be converted to :sparkles: using EmojiOne images.
- Currently unicode symbols like `✨` and ASCII emoji like `:D` are not supported.

## MathJax

The following MathJax delimiters are supported:

- inline math: `\(math\)` and `$math$`
- display math: `\[math\]` and `$$math$$`

The following rules apply to your markdown content when MathJax is enabled:

- Regular dollar sign `$` in text that is not part of a math formula should be escaped: `\$`
- Regular markdown escaping for parentheses: `\(` and `\)`, and brackets: `\[` and `\]` is not supported. MathJax will convert anything between these delimiters to math formulas, unless they are wrapped in backticks: `` `\(` `` or fenced code blocks.

## Mermaid

Render Mermaid diagrams wrapped in `mmd` or `mermaid` fenced code blocks:

    ```mmd
    sequenceDiagram
    ```

## Scroll

Remember scroll position:

- When enabled, the `scroll` option remembers the current scroll position and scrolls back to it after page reload.
- When disabled, the `scroll` option will either scroll to the top of the document or to a certain header (anchor) if a hash URL fragment was present.

## Syntax

Syntax highlighting for fenced code blocks:

    ```js
    var hello = 'hi'
    ```

The full list of enabled languages and their names can be found [here][prism-lang].

## ToC

Generates Table of Contents (ToC) based on the headers found in the markdown document.

---

# Themes

All themes support the following width options:

- `auto` - automatically adjust the content width based on the screen size
- `full` - 100% screen width
- `wide` - fixed at 1400px
- `large` - fixed at 1200px
- `medium` - fixed at 992px
- `small` - fixed at 768px
- `tiny` - fixed at 576px

The `auto` option on the `github` and `github-dark` themes has a fixed width with a surrounding border identical to a rendered README.md file for a repository on github.com

---

# Manage Origins

Access to [local file URLs](#local-files) can be enabled by using the `Allow access to file URLs` option for the extension.

Access to remote origins, however, have to be enabled explicitly.

## Add Origin

Here is how you can enable the extension on the `https://raw.githubusercontent.com` origin:

![img-add-origin]

The origin consists of a *protocol* and a *domain* part. The *protocol* can be either `https`, `http`, or a `*` to match both `https` and `http`.

## Allow All Origins

In case you really want to you can enable the extension for **all** origins:

![img-all-origins]

Alternatively you can use the `Allow All` button.

Take a look at the [Path Matching Priority](#path-matching-priority) section below on how the Markdown content can be included for or excluded from rendering when access to all origins is enabled!

## Remove Origin

Click on the `REMOVE` button for the origin that you want to remove. This removes the permission itself so that the extension no longer has access to that origin.

## Refresh Origin

The extension synchronizes your preferences across all of your devices using Google Sync. The list of your allowed origins is being synced too. However, the actual permissions that you grant using the Chrome's consent popup cannot be synced.

In case you have added a new origin on some of your devices you will have to explicitly allow it on your other devices. In this case an additional **`refresh`** label will be shown on each origin that needs to be _refreshed_. This label will be present only on those devices and origins that needs to be _refreshed_, meaning currently the extension does not have access to those origins. Expanding the origin will reveal an additional `REFRESH` button:

![img-refresh-origin]

---

# Markdown Detection

Markdown Viewer can only access explicitly allowed remote origins and the file origin, if enabled. However, not all content served on those origins will be a Markdown file.

## Header Detection

When this option is enabled the extension will check for the existence of the `text/markdown` and `text/x-markdown` *content-type* header before trying to match the path:

![header-detection]

## Path Matching

If the header detection is disabled or a proper *content-type* header is missing, the extension will check if the URL is ending with a markdown file extension.

The default regular expression is: `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

It is a simple regular expression that matches URLs ending with:

- markdown file extension: `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)`
- and optionally a hash or a querystring after that: `(?:#.*|\?.*)?`

> The `?:` used in `(?:match)` stands for *non-capturing group* and it's there for performance reasons.

You can modify the path matching regular expression for each enabled origin individually. The settings are being updated as you type.

## Path Matching Priority

The enabled origins are matched from most to least specific:

1. `https://raw.githubusercontent.com` or `http://raw.githubusercontent.com`
2. `*://raw.githubusercontent.com`
3. `*://*`

Only the first matching origin is picked and then its Path Matching RegExp is used to match the entire URL. If it fails then no other attempts are being made to match the URL.

> It is recommended to explicitly allow only the origins that you want the extension to have access to.

### Custom Path

- **`*://website.com`** - specific origin with custom Path Matching RegExp:<br>
  `\/some\/custom\/path\/to\/serve\/markdown\/$`

- **`*://*`** - match all origins using the default Path Matching RegExp:<br>
  `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

In case we want to match a custom path we have to add a more specific origin and set its Path Matching RegExp accordingly.

### Exclude Origin

- **`*://github.com`** - specific origin with invalid Path Matching RegExp:<br>
  `something impossible to match !!!`

- **`*://*`** - match all origins using the default Path Matching RegExp:<br>
  `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

Some origins may serve rendered HTML content on URLs ending with markdown file extension:

GitHub:
- https://github.com/simov/markdown-syntax/blob/main/README.md - *HTML*
- https://raw.githubusercontent.com/simov/markdown-syntax/main/README.md - *Markdown*

In this case we want to exclude the `github.com` origin altogether and for that we have to add a more specific origin and set its Path Matching RegExp to something that's impossible to match.

### Exclude Path

- **`*://bitbucket.org`** - specific origin with custom Path Matching RegExp:<br>
  `.*\/raw\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

- **`*://gitlab.com`** - specific origin with custom Path Matching RegExp:<br>
  `.*\/raw\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

- **`*://*`** - match all origins using the default Path Matching RegExp:<br>
  `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

Some origins may serve rendered HTML content on URLs ending with markdown file extension:

BitBucket:
- https://bitbucket.org/simovelichkov/markdown-syntax/src/main/README.md - *HTML*
- https://bitbucket.org/simovelichkov/markdown-syntax/raw/main/README.md - *Markdown*

GitLab:
- https://gitlab.com/simovelichkov/markdown-syntax/blob/main/README.md - *HTML*
- https://gitlab.com/simovelichkov/markdown-syntax/raw/main/README.md - *Markdown*

In this case we want to match Markdown files only when their path contains the `raw` word, and for that we have to add a more specific origin and update its Path Matching RegExp accordingly.

---

# Syntax Examples

A separate repository containing examples about the Markdown syntax and all features available in Markdown Viewer can be found on [GitHub][syntax-github], [GitLab][syntax-gitlab] and [BitBucket][syntax-bitbucket]:

- **elements.md** - quick overview of the Markdown syntax and all features available in Markdown Viewer
- **syntax.md** - extensive list of Markdown syntax examples with different combinations and edge cases
- **prism.md** - syntax highlighting examples, for the full list of currently supported languages take a look at [this file][prism-lang]
- **mermaid.md** - different types of Mermaid diagrams
- **mathjax.md** - MathJax examples and support documentation

Allow the appropriate remote origin and update its path matching regexp if needed:

- **`raw.githubusercontent.com`** using the default Path Matching RegExp:<br>
  `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

- **`bitbucket.org`** only paths containing the `raw` word and ending with the default Path Matching RegExp:<br>
  `.*\/raw\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

- **`gitlab.com`** only paths containing the `raw` word and ending with the default Path Matching RegExp:<br>
  `.*\/raw\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

Alternatively, pull any of those repositories and access them on the `file:///` origin locally.

---

# Manual Install

The following instructions applies for: Chrome, Edge, Opera, Brave, Chromium and Vivaldi.

Note that in any of the following cases you won't receive any future updates automatically!

## Load packed .crx

1. Go to [releases] and pick a release that you want to install
2. Download the markdown-viewer.crx file
3. Navigate to `chrome://extensions`
4. Make sure that the `Developer mode` switch is enabled
5. Drag and drop the markdown-viewer.crx file into the chrome://extensions page

## Load unpacked .zip

1. Go to [releases] and pick a release that you want to install
2. Download the markdown-viewer.zip file and extract it
3. Navigate to `chrome://extensions`
4. Make sure that the `Developer mode` switch is enabled
5. Click on the `Load unpacked` button and select the extracted directory

## Build

1. Clone this repository
2. Execute `sh build/package.sh chrome` (append `compilers` to include all available compilers)
3. Navigate to `chrome://extensions`
4. Make sure that the `Developer mode` switch is enabled
5. Click on the `Load unpacked` button and select the cloned directory

## Manifest v2

1. Clone the [mv2] or [compilers-mv2] branch (Markdown Viewer v4.0)
2. Navigate to `chrome://extensions`
3. Make sure that the `Developer mode` switch is enabled
4. Click on the `Load unpacked` button and select the cloned directory

---

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
  [edge]: https://microsoftedge.microsoft.com/addons/detail/markdown-viewer/cgfmehpekedojlmjepoimbfcafopimdg
  [opera]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [brave]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [chromium]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk
  [vivaldi]: https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk

  [marked]: https://github.com/markedjs/marked
  [remark]: https://github.com/remarkjs/remark
  [showdown]: https://github.com/showdownjs/showdown
  [markdown-it]: https://github.com/markdown-it/markdown-it
  [remarkable]: https://github.com/jonschlinkert/remarkable
  [commonmark]: https://github.com/commonmark/commonmark.js

  [emojione]: https://emojione.com
  [mathjax]: https://www.mathjax.org
  [mermaid]: https://mermaid-js.github.io/mermaid/
  [prism]: https://prismjs.com
  [github-theme]: https://github.com/sindresorhus/github-markdown-css
  [cleanrmd]: https://pkg.garrickadenbuie.com/cleanrmd/#themes

  [gfm]: https://github.github.com/gfm/
  [compilers]: https://github.com/simov/markdown-viewer/tree/compilers
  [releases]: https://github.com/simov/markdown-viewer/releases
  [mv2]: https://github.com/simov/markdown-viewer/tree/mv2
  [compilers-mv2]: https://github.com/simov/markdown-viewer/tree/compilers-mv2
  [prism-lang]: https://github.com/simov/markdown-viewer/blob/main/build/prism/prism.json

  [syntax-github]: https://github.com/simov/markdown-syntax
  [syntax-gitlab]: https://gitlab.com/simovelichkov/markdown-syntax
  [syntax-bitbucket]: https://bitbucket.org/simovelichkov/markdown-syntax

  [img-extensions]: https://i.imgur.com/kzullaI.png
  [img-file-access]: https://i.imgur.com/VVcPv0T.png
  [img-add-origin]: https://i.imgur.com/GnKmkRG.png
  [img-all-origins]: https://i.imgur.com/4GH3EuP.png
  [img-refresh-origin]: https://i.imgur.com/6COtyrP.png
  [header-detection]: https://i.imgur.com/bdz3Reg.png
