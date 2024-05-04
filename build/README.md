
# Build

Build the `themes` and `vendor` folders, and create the `markdown-viewer.zip` package:

```bash
# pick a release tag
git clone --depth 1 --branch 5.2 https://github.com/simov/markdown-viewer.git
cd markdown-viewer/
# build
sh build/package.sh
```

## Build Dependencies

- node >= 18
- npm >= 10
- git
- zip

## Markdown Viewer Dependencies

| module | version
| :-     | -:
| bootstrap           | 5.3.3
| cleanrmd            | 0.1.0
| github-markdown-css | 5.5.1
| mathjax             | 3.2.2
| mermaid             | 10.8.0
| mithril             | 1.1.7
| prismjs             | 1.29.0
| csso                | 5.0.5
| @panzoom/panzoom    | 4.5.1
| **markdown-it**
| markdown-it            | 13.0.1
| markdown-it-abbr       | 1.0.4
| markdown-it-anchor     | 8.6.7
| markdown-it-attrs      | 4.1.6
| markdown-it-cjk-breaks | 1.1.3
| markdown-it-deflist    | 2.1.0
| markdown-it-footnote   | 3.0.3
| markdown-it-gridtables | 0.4.0
| markdown-it-ins        | 3.0.1
| markdown-it-mark       | 3.0.1
| markdown-it-sub        | 1.0.0
| markdown-it-sup        | 1.0.0
| markdown-it-task-lists | 2.1.1
| github-slugger         | 2.0.0
| **marked**
| marked                | 12.0.1
| marked-gfm-heading-id | 3.1.3
| marked-linkify-it     | 3.1.9
| marked-smartypants    | 1.1.6
| **remark**
| remark        | 15.0.1
| remark-breaks | 4.0.0
| remark-gfm    | 4.0.0
| remark-html   | 16.0.1
| remark-slug   | 7.0.1
| **mdc**
| @material/button    | 0.37.1
| @material/ripple    | 0.37.1
| @material/switch    | 0.36.1
| @material/tabs      | 0.37.1
| @material/textfield | 0.37.1
