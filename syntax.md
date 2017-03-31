
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

[![Alt Text](http://i.imgur.com/rKYxW.jpg)](https://github.com/simov/markdown-viewer)

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

## Mention

@simov


## Emoji

:wave: ![](https://assets-cdn.github.com/images/icons/emoji/unicode/1f44b.png)


## Footnotes

Something [^1]

  [^1]: https://github.com/simov/markdown-viewer


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


# Quirks

1. item 1

```
code block
```

2. item 2

3. item 3
