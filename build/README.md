
# Build

Build the `themes` and `vendor` folders, and create the `markdown-viewer.zip` package:

```bash
# pick a release tag
git clone --depth 1 --branch 5.0 https://github.com/simov/markdown-viewer.git
cd markdown-viewer/
# build
sh build/package.sh
```

## Build Dependencies

- Node.js >= 14
- git
- curl
- zip

## Markdown Viewer Dependencies

| Module              | Version
| :-                  | :-
| @material/button    | ^0.37.1
| @material/ripple    | ^0.37.1
| @material/switch    | ^0.36.1
| @material/tabs      | ^0.37.1
| @material/textfield | ^0.37.1
| emojione            |  2.2.7
| marked              |  1.2.7
| mathjax             |  3.2.2
| mermaid             |  9.1.6
| mithril             |  1.1.6
| prismjs             |  1.22.0
| remark              | ^13.0.0
| remark-breaks       | ^2.0.1
| remark-footnotes    | ^3.0.0
| remark-frontmatter  | ^3.0.0
| remark-gfm          | ^1.0.0
| remark-html         | ^13.0.1
| remark-slug         | ^6.0.0
