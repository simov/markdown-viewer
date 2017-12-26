
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


# HTML

<div style="text-decoration: underline;">
  <p><strong>HTML</strong> tags</p>
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


# Extras

## Escapes

<em\>HTML tags</em\>

\\ \` \* \_ \{ \} \# \+ \- \. \!

\[ mathjax \]

\( mathjax \)

`` `\(` ``

````
```
fenced code block
```
````


## Mention

@simov


## Emoji

- shortname: :wave: :alien:
- unicode: 👋 👽
- ascii: :D :/


## Footnotes


Something something[^named]

And something else[^1], and a link[^2]


[^1]: This reference footnote contains a paragraph...

    * ...and a list

[^2]: https://github.com/simov/markdown-viewer
[^named]: https://github.com/simov/markdown-viewer


## Syntax Highlighting

```actionscript
var some = new actionscript();
```

```apacheconf
ServerName apacheconf
```

```aspnet
<asp:Label runat="server" id="aspnet"></asp:Label>
```

```bash
$some = "bash";
```

```basic
Dim basic As Integer
```

```batch
set some="batch"
```

```c
char some = "c";
```

```coffeescript
some = "coffeescript"
```

```cpp
char some = "cpp";
```

```csharp
string some = "csharp";
```

```css
#some { content: 'css'; }
```

```dart
var some = "dart";
```

```docker
MAINTAINER docker
```

```erlang
module(erlang).
```

```go
type go string
```

```haskell
haskell :: Str -> String
```

```html
<p id="some">html</p>
```

```java
public static final void main java();
```

```javascript
let some = 'javascript';
```

```js
const some = 'js';
```

```json
{"some": "json"}
```

```jsonp
function({"some": "jsonp"})
```

```lua
local some = "lua"
```

```makefile
check: makefile
```

```markdown
`some` **markdown**
```

```html
<p>some <strong>markup</strong></p>
```

```nginx
server_name nginx;
```

```objectivec
char some = "objectivec";
```

```perl
$some = "perl";
```

```php
$some = "php";
```

```prolog
some('prolog', 1972)
```

```python
some = 'python'
```

```ruby
some = "ruby"
```

```rust
let some = 'rust';
```

```sass
@include sass;
```

```scheme
(define some 'scheme')
```

```scss
@include scss;
```

```smalltalk
'some smalltalk'
```

```sql
select * from `language` where `name` = 'sql';
```

```swift
var some = "swift"
```

```typescript
var some: string = "typescript";
```

```xml
<some name="xml"></some>
```

```yaml
- language: yaml
```


# MathJax

## Delimiters

Delimiter                         | Format      | Expression                  | Result                    | Support
:---                              | :---:       | :---                        | :---:                     | :---:
No delimiters                     | `str`       | `\sqrt{3x-1}+(1+x)^2`       | \sqrt{3x-1}+(1+x)^2       | no
Bracket without backslash         | `[str]`     | `[\sqrt{3x-1}+(1+x)^2]`     | [\sqrt{3x-1}+(1+x)^2]     | no
Single backslash with bracket     | `\[str\]`   | `\[\sqrt{3x-1}+(1+x)^2\]`   | \[\sqrt{3x-1}+(1+x)^2\]   | **yes**
Double backslash with bracket     | `\\[str\\]` | `\\[\sqrt{3x-1}+(1+x)^2\\]` | \\[\sqrt{3x-1}+(1+x)^2\\] | no
Parentheses without backslash     | `(str)`     | `(\sqrt{3x-1}+(1+x)^2)`     | (\sqrt{3x-1}+(1+x)^2)     | no
Single backslash with parentheses | `\(str\)`   | `\(\sqrt{3x-1}+(1+x)^2\)`   | \(\sqrt{3x-1}+(1+x)^2\)   | **yes**
Double backslash with parentheses | `\\(str\\)` | `\\(\sqrt{3x-1}+(1+x)^2\\)` | \\(\sqrt{3x-1}+(1+x)^2\\) | no
Single dollar sign                | `$str$`     | `$\sqrt{3x-1}+(1+x)^2$`     | $\sqrt{3x-1}+(1+x)^2$     | **yes**
Double dollar sign                | `$$str$$`   | `$$\sqrt{3x-1}+(1+x)^2$$`   | $$\sqrt{3x-1}+(1+x)^2$$   | **yes**

## Markdown

Expressions containing underscore `_`:

### `\(` single line `\)`

`\(x_i = x_\gamma\)` \(x_i = x_\gamma\)

### `\(` multiline `\)`

```
\(
x_i = x_\gamma
\)
```

\(
x_i = x_\gamma
\)

---

### `\[` single line `\]`

`\[x_i = x_\gamma\]` \[x_i = x_\gamma\]

### `\[` multiline `\]`

```
\[
x_i = x_\gamma
\]
```

\[
x_i = x_\gamma
\]

---

### `$` single line `$`

`$x_i = x_\gamma$` $x_i = x_\gamma$

### `$` multiline `$`

**Not supported!**

```
$
x_i = x_\gamma
$
```

$
x_i = x_\gamma
$

---

### `$$` single line `$$`

`$$x_i = x_\gamma$$` $$x_i = x_\gamma$$

### `$$` multiline `$$`

```
$$
x_i = x_\gamma
$$
```

$$
x_i = x_\gamma
$$

---

### `\begin{}` multiline `\end{}`

```
\begin{align}
x_i = x_\gamma
\end{align}
```

\begin{align}
x_i = x_\gamma
\end{align}


## HTML

`<`, `>` and `&` symbols

- `\(x<y\)` \(x<y\)
- `\(x>y\)` \(x>y\)
- `\(x&a\)` \(x&a\)

## **Money**

\$6.20 and \$0.5

$4.40

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
