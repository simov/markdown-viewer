
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

- node >= 14
- npm
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
| cleanrmd            |  0.1.0
| emojione            |  2.2.7
| github-markdown-css |  5.1.0
| marked              |  4.1.1
| mathjax             |  3.2.2
| mermaid             |  9.1.6
| mithril             |  1.1.6
| prismjs             | ^1.29.0
| remark              | ^14.0.2
| remark-breaks       | ^3.0.2
| remark-footnotes    | ^4.0.1
| remark-frontmatter  | ^4.0.1
| remark-gfm          | ^3.0.1
| remark-html         | ^15.0.1
| remark-slug         | ^7.0.1
