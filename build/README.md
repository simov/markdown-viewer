
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

- node >= 18
- npm >= 10
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
| bootstrap           |  5.2.3
| cleanrmd            |  0.1.0
| emojione            |  2.2.7
| github-markdown-css |  5.2.0
| github-slugger      | ^2.0.0
| markdown-it         | ^13.0.1
| markdown-it-abbr    | ^1.0.4
| markdown-it-anchor  | ^8.6.7
| markdown-it-attrs   | ^4.1.6
| markdown-it-cjk-breaks | ^1.1.3
| markdown-it-deflist | ^2.1.0
| markdown-it-footnote| ^3.0.3
| markdown-it-ins     | ^3.0.1
| markdown-it-mark    | ^3.0.1
| markdown-it-sub     | ^1.0.0
| markdown-it-sup     | ^1.0.0
| markdown-it-task-lists | ^2.1.1
| marked                | ^9.0.3
| marked-gfm-heading-id | ^3.0.8
| marked-linkify-it     | ^3.1.4
| marked-smartypants    | ^1.1.3
| mathjax             |  3.2.2
| mermaid             | 10.4.0
| mithril             |  1.1.6
| prismjs             | ^1.29.0
| remark              | ^14.0.2
| remark-breaks       | ^3.0.2
| remark-footnotes    | ^4.0.1
| remark-gfm          | ^3.0.1
| remark-html         | ^15.0.2
| remark-slug         | ^7.0.1

## Additional Compilers

| Module              | Version
| :-                  | :-
| commonmark          | 0.29.3
| remarkable          | 1.7.4
| showdown            | 2.1.0
