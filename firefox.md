
# Markdown Viewer on Firefox

## Table of Contents

- **[Access to local file:/// URLs on Linux](#access-to-local-file-urls-on-linux)**
- **[Autoreload on localhost](#autoreload-on-localhost)**
- **[Remote origins with strict CSP](#remote-origins-with-strict-csp)**

## Compatibility Matrix

| Origin       | Type   | Headers                                     | Render | Autoreload
| :-           | :-:    | :-                                          | :-     | :-
| `file:///`   | local  | requires mime type fix on Linux             | ✔      | ✖
| `http(s)://` | local  | `content-type: text/plain`                  | ✔      | ✔
| `http(s)://` | remote | `content-type: text/plain` + non strict CSP | ✔      | ✖
| `http(s)://` | remote | strict CSP                                  | ✖      | ✖

---

# Access to local file:/// URLs on Linux

Unlike Chromium based browsers Firefox will prompt you to download or open files with an external app, that are served with the `text/markdown` content type. For that reason markdown files have to be served using the `text/plain` content type instead.

The following are a few methods to enable `file:///` access on Linux:

## Method 1

Create `~/.mime.types` file with the following content:

```
type=text/plain exts=md,mkd,mkdn,mdwn,mdown,markdown, desc="Markdown document"
```

Restart Firefox

## Method 2

In case Firefox was installed as a snap _Method 1_ won't work.

Create `/home/me/snap/firefox/common/mime.types` file with the following content (replace `me` with your user):

```
type=text/plain exts=md,mkd,mkdn,mdwn,mdown,markdown, desc="Markdown document"
```

Go to `about:config` in Firefox and search for `helpers.private_mime_types_file`

Replace the default path there with `/home/me/snap/firefox/common/mime.types` (replace `me` with your user)

Restart Firefox

## Method 3

Create `~/.local/share/mime/packages/text-markdown.xml` file with the following content:

```xml
<?xml version="1.0"?>
<mime-info xmlns='http://www.freedesktop.org/standards/shared-mime-info'>
  <mime-type type="text/plain">
    <glob pattern="*.md"/>
    <glob pattern="*.mkd"/>
    <glob pattern="*.mkdn"/>
    <glob pattern="*.mdwn"/>
    <glob pattern="*.mdown"/>
    <glob pattern="*.markdown"/>
  </mime-type>
</mime-info>
```

Execute:

```bash
update-mime-database ~/.local/share/mime
```

---

# Autoreload on localhost

The `autoreload` feature is available only for content served on `localhost` and it won't work on `file:///` URLs because of CSP (Content Security Policy) limitations.

Any file server can be used locally as long as it serves the markdown files with the `text/plain` content type.

Here is an example file server using Node.js (replace `me` with your user):

```js
var express = require('express')
var serveIndex = require('serve-index')
var serveStatic = require('serve-static')

express()
  // serve markdown files with content-type: text/plain in Firefox
  .use((req, res, next) => {
    // by default serve-static serves markdown content with content-type: text/markdown
    if (
      /Firefox/.test(req.headers['user-agent']) &&
      // the default Path Matching RegExp in Markdown Viewer
      /\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\?.*)?$/.test(req.url)
    ) {
      res.setHeader('content-type', 'text/plain; charset=utf-8')
    }
    next()
  })
  .use(serveStatic('/home/me'))
  .use('/', serveIndex('/home/me', {'icons': true, view: 'details'}))
  .listen(8000)
```

Go to the Advanced Options page for the extension and enable the `http://localhost` origin (note that port is omitted).

Run the above JavaScript file using Node.js and navigate to `http://localhost:8000` in Firefox.

You can use any other host name configured in your `hosts` file that resolves to localhost:

```hosts
127.0.0.1    ssd
```

Then you only need to enable that origin `http://ssd` in the Advanced Options page as well.

The above script can be run on system startup using SystemD or any other service manager.

---

# Remote origins with strict CSP

Remote origins that serve markdown files with `text/plain` content type and do not enforce strict CSP (Content Security Policy) can be enabled using the Advanced Options page.

For example, content hosted on `gitlab.com` and `bitbucket.org` can be enabled and subsequently it will get rendered:

- https://gitlab.com/simovelichkov/markdown-syntax/-/raw/main/README.md
- https://bitbucket.org/simovelichkov/markdown-syntax/raw/main/README.md

Remote origins with strict CSP however, such as `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` will be blocked by Firefox.

For example, content hosted on GitHub's `raw.githubusercontent.com` cannot be rendered even if that origin was enabled in the Advanced Options page:

- https://raw.githubusercontent.com/simov/markdown-syntax/main/README.md

---
