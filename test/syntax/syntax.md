
# h1

h1
===

## h2

h2
---

### h3

#### h4

##### h5

###### h6

#h1

##h2

###h3

####h4

#####h5

######h6

# 测试一
## 测试二
### 测试三

# a/b c-d


# Horizontal Line

---

***

___

- - -

* * *

_ _ _


# List

- ul
  - ul
    - ul


* ul
  * ul
    * ul


+ ul
  + ul
    + ul


+ ul
  - ul
    * ul


- ul
    - ul
        - ul


1. ol
  1. ol
    1. ol


1. ol
    1. ol
        1. ol


# Text Formatting

**bold**

__bold__

*italic*

_italic_

`inline code`

> blockquote


## Combinations

> first
>> second
> > > third
> blockquote

*`something`*

**`something`**

_`something`_

__`something`__

***`something`***

___`something`___

__*`something`*__

*__`something`__*

**_`something`_**

_**`something`**_

> `blockquote`

> **`blockquote`**

> ***`blockquote`***


# Link

[link with inline URL](https://github.com/simov/markdown-viewer)

[link with index][1]

[named link][some-url]

[some-url]

[some-url][]

[parentheses in URL](https://en.wikipedia.org/wiki/Scheme_(programming_language))

[escaped parentheses in URL](https://en.wikipedia.org/wiki/Scheme_\(programming_language\))

<someone@gmail.com>

<https://github.com/simov/markdown-viewer>

https://github.com/simov/markdown-viewer


# Image

![named-image]

![2]

![2][]

![][2]

[![3]][some-url]

[![named-image]][some-url]

![](http://i.imgur.com/rKYxW.jpg "Inline Alt Text")

[![](http://i.imgur.com/rKYxW.jpg)](https://github.com/simov/markdown-viewer)

  [1]: https://github.com/simov/markdown-viewer
  [2]: http://i.imgur.com/rKYxW.jpg (Image Index)
  [3]: http://i.imgur.com/rKYxW.jpg (Image Index with Link)
  [named-image]: http://i.imgur.com/rKYxW.jpg "Named Image"
  [some-url]: https://github.com/simov/markdown-viewer


# Code Block

    code block using indentation

```
fenced code block using backtick
```

~~~
fenced code block using tilde
~~~


# GFM


## Table

table        | col             | col                | col
---          | :---            | :---:              | ---:
default      | align left      | centered           | align right
default left | align left left | something centered | something align right
default      | align left      | centered           | align right


## Strikethrough

~~strikethrough~~

~~`something`~~

~~**`something`**~~

~~***`something`***~~

~~__`something`__~~

~~___`something`___~~

~~__*`something`*__~~

~~*__`something`__*~~

~~**_`something`_**~~

~~_**`something`**_~~

> ~~**_`something`_**~~


## Task List

- [x] task
- [ ] task


# HTML

<h2>HTML Tags</h2>
<div style="text-decoration: underline;">
  <p><strong>bold</strong> and underline</p>
</div>


## Details/Summary

<details>
<summary>Click to Expand</summary>

```js
var code = 'block'
```

### Inner Header

[link](https://github.com/simov/markdown-viewer)
</details>


## Definition List

<dl>
  <dt>Name</dt>
  <dd>Godzilla</dd>
  <dt>Born</dt>
  <dd>1952</dd>
  <dt>Birthplace</dt>
  <dd>Japan</dd>
  <dt>Color</dt>
  <dd>Green</dd>
</dl>


## KBD

<kbd>the kbd tag</kbd>


## Supscript/subscript

- 19<sup>th</sup>
- H<sub>2</sub>O



# Extras

## Emoji

- shortcode: :wave: :alien:
- unicode: 👋 👽
- ascii: :D :/


## MathJax

- [Examples and Syntax](mathjax.md)


## Syntax Highlighting

- [Examples and Syntax](highlighting.md)


## Escapes

<em\>HTML tags</em\>

\\ \` \* \_ \{ \} \# \+ \- \. \! \[ \] \( \)

`` `\(` ``

````
```
fenced code block
```
````

## Mention

@simov


## Footnotes


Something something[^named]

And something else[^1], and a link[^2]


[^1]: This reference footnote contains a paragraph...

    * ...and a list

[^2]: https://github.com/simov/markdown-viewer
[^named]: https://github.com/simov/markdown-viewer


---


# Quirks

1. item 1

```
code block
```

2. item 2

3. item 3

# Nested tables in lists

case 0: a table at indentation level 0, after a paragraph (at level 0) -- this should render the table not-indented

|A|B|
|---|---|
|1|2|

* case 1: a table at indentation level 1, after a list item at level 1 -- this should render the table indented once

    |A|B|
    |---|---|
    |1|2|

    * case 2: a table at indentation level 2, after a list item at level 2 -- this should render the table indented twice

        |A|B|
        |---|---|
        |1|2|

case 3: a table at indentation level 1, after a a paragraph (at level 0) -- this should render the raw text into a code block

    |A|B|
    |---|---|
    |1|2|
