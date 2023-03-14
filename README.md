
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
- **[Syntax Examples](#syntax-examples)**

> Additional documentation specific to [Firefox][firefox-docs]

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

> For the rest of the supported compilers follow the [Manual Install](#manual-install) steps.

---

# Content Options

| Option          | Default | Description
| :-              | :-:     | :-
| **autoreload**  | `false` | Auto reload on file change
| **emoji**       | `false` | Convert emoji :shortnames: into EmojiOne images
| **mathjax**     | `false` | Render MathJax formulas
| **mermaid**     | `false` | Render Mermaid diagrams
| **syntax**      | `true`  | Syntax highlighted fenced code blocks
| **toc**         | `false` | Generate Table of Contents

## Autoreload

When enabled the extension will make a GET request every second to markdown files hosted on:

- `file:///` URLs
- any host that resolves to localhost IPv4 `127.0.0.1` or IPv6 `::1`

## Emoji

Convert emoji :shortnames: into EmojiOne images:

- Emoji shortnames like `:smile:` will be converted to :smile: using EmojiOne images.
- Currently unicode symbols like `😄` and ASCII emoji like `:D` are not supported.

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

Alternatively diagrams can be wrapped in HTML tags:

```html
<pre><code class="mermaid">
  sequenceDiagram
</code></pre>
```

## Syntax

Syntax highlighting for fenced code blocks:

    ```js
    var hello = 'hi'
    ```

Alternatively code blocks can be wrapped in HTML tags:

```html
<pre class="language-js"><code class="language-js">var hello = 'hi'</code></pre>
```

> Full list of supported languages and their corresponding [aliases][prism-lang] to use.

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

The `auto` option on the `github` and `github-dark` themes has a fixed width with a surrounding border identical to a rendered README.md file for a repository hosted on github.com

---

# Manage Origins

Click on the Markdown Viewer icon and select [Advanced Options](#manage-origins).

By default Markdown Viewer does not have access to any content:

![img-no-access]

## Enable File Access

To enable access to file URLs follow [these steps](#local-files).

In case access to local files was not enabled you will see an additional `Allow Access` button next to the File Access header:

![img-file-access-allow]

Clicking on it will point you to the built-in management page for the extension where you can toggle the `Allow access to file URLs` switch to enable it.

## Enable Site Access

Access to individual sites can be enabled by copy/pasting a URL address into the Site Access text box and then clicking on the `Add` button next to it:

![img-site-access-add]

> Additionally the URL scheme can be replaced with a `*` to enable access to both `http` and `https`.

> Access to all subdomains for a host can be specified immediately after the protocol part: `https://*.mydomain.com`

## Allow on All Sites

Access to **all** sites can be enabled by clicking on the `Allow All` button next to the Site Access header:

![img-site-allow-all]

> This is identical to adding the `*://*` pattern into the text box.

## Content Detection

Each enabled origin has an option for content type header detection and path matching regular expression:

![img-site-access-enabled]

### Header Detection

When this option is enabled the extension will check for the existence of the `content-type` header with a value set to either the `text/markdown`, `text/x-markdown` or `text/plain` content type.

### Path Matching

When this option is enabled the extension will check if the page URL matches the Path Matching RegExp.

The default regular expression is: `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$`

It is a simple regular expression that matches URLs ending with:

- markdown file extension: `\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)`
- and optionally a hash or a querystring after that: `(?:#.*|\?.*)?`

> The `?:` used in `(?:match)` stands for *non-capturing group* and it's there for performance reasons.

You can modify the path matching regular expression for each enabled origin individually. The settings are being updated as you type.

### Path Matching Priority

The enabled origins are matched from most specific to least specific:

1. `https://raw.githubusercontent.com` or `http://raw.githubusercontent.com`
2. `*://raw.githubusercontent.com`
3. `*://*`

The matching origin with the highest priority will be picked and its header detection and path matching settings will be used to determine if the content should be rendered or not.

> It is recommended to explicitly allow only the origins that you want the extension to have access to.

## Remove Origin

Click on the `Remove` button for the origin that you want to remove. This removes the permission itself so that the extension can no longer access that origin.

## Refresh Origin

The extension synchronizes your preferences across all of your devices using Google Sync. The list of your allowed origins is being synced too. However, the actual permissions that you grant using the Chrome's consent popup cannot be synced.

In case you have added a new origin on some of your devices you will have to explicitly allow it on your other devices. In this case the origin will be highlighted and an additional `Refresh` button will be present:

![img-site-refresh]

Only origins that needs to be refreshed will be highlighted. The extension cannot access highlighted origins unless you click on the `Refresh` button.

> In some cases access to previously allowed origins may get disabled. Make sure you check back the advanced options page or reload it and look for highlighted origins that needs to be refreshed.

---

# Syntax Examples

Examples about the Markdown syntax and all features available in Markdown Viewer can be found on [GitHub][syntax-github], [GitLab][syntax-gitlab] and [BitBucket][syntax-bitbucket]:

- **elements.md** - quick overview of the Markdown syntax and a summary of the Markdown Viewer features
- **syntax.md** - extensive list of Markdown syntax examples with different combinations and edge cases
- **prism.md** - syntax highlighting examples
- **mermaid.md** - different types of Mermaid diagrams
- **mathjax.md** - MathJax examples and support documentation

Allow the appropriate remote origin or pull any of those repositories and access them on the `file:///` origin locally.

---

# Manual Install

The following instructions applies for: Chrome, Edge, Opera, Brave, Chromium and Vivaldi.

Note that in any of the following cases you won't receive any future updates automatically!

## Load packed .crx

1. Go to [releases] and pick a release that you want to install
2. Download the `markdown-viewer.crx` file
3. Navigate to `chrome://extensions`
4. Drag and drop the `markdown-viewer.crx` file into the `chrome://extensions` page

## Load unpacked .zip

1. Go to [releases] and pick a release that you want to install
2. Download the `markdown-viewer.zip` file and extract it
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
  [mermaid]: https://mermaid.js.org
  [prism]: https://prismjs.com
  [github-theme]: https://github.com/sindresorhus/github-markdown-css
  [cleanrmd]: https://pkg.garrickadenbuie.com/cleanrmd/#themes

  [gfm]: https://github.github.com/gfm/
  [prism-lang]: https://prismjs.com/#supported-languages
  [compilers]: https://github.com/simov/markdown-viewer/tree/compilers
  [releases]: https://github.com/simov/markdown-viewer/releases
  [mv2]: https://github.com/simov/markdown-viewer/tree/mv2
  [compilers-mv2]: https://github.com/simov/markdown-viewer/tree/compilers-mv2
  [firefox-docs]: https://github.com/simov/markdown-viewer/blob/main/firefox.md

  [syntax-github]: https://github.com/simov/markdown-syntax
  [syntax-gitlab]: https://gitlab.com/simovelichkov/markdown-syntax
  [syntax-bitbucket]: https://bitbucket.org/simovelichkov/markdown-syntax

  [img-extensions]: https://i.imgur.com/kzullaI.png
  [img-file-access]: https://i.imgur.com/VVcPv0T.png
  [img-no-access]: https://i.imgur.com/U6mjgX0.png
  [img-file-access-allow]: https://i.imgur.com/2bStHeb.png
  [img-site-access-add]: https://i.imgur.com/CFg9JBt.png
  [img-site-allow-all]: https://i.imgur.com/MXZqFOB.png
  [img-site-access-enabled]: https://i.imgur.com/tFMzJ3l.png
  [img-site-refresh]: https://i.imgur.com/j0gATxT.png
