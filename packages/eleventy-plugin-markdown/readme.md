# @e11ty/eleventy-plugin-markdown

An [Eleventy](https://www.11ty.dev/) markdown plugin enhancement around [markdown-it](https://github.com/markdown-it/markdown-it). This plugin includes necessary plugins and some normalization logic for building static sites in 11ty.

> **NOTE**
> This enhancement plugin is tailored to my specific development approach and to some degree that tooling I use and maintain. Universal usage might require adjustments in certain contexts due to its custom nature.

### Included

The enhancement comes with [markdown-it](https://github.com/markdown-it/markdown-it) installed as a dependency, along with the following markdown-it plugins.

- [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor#readme)
- [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs)

# Install

The [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) module is a peer and needs to be installed along side it.

```cli
pnpm add @e11ty/eleventy-plugin-markdown -D
```

# Usage

There is a named export of `markdown` which expects the `eleventyConfig` be provided. The options parameter can be used to hook into the transform cycles and is also where you can control the included plugins options. Optionally use with [11ty.ts](https://github.com/panoply/e11ty/packages/11ty.ts) wrapper for type completions.

<!-- prettier-ignore -->
```ts
const { defineConfig } = require('11ty.ts'); // Optional
const { markdown } = require('@e11ty/eleventy-plugin-markdown');
const papyrus = require('papyrus');

module.exports = defineConfig(eleventyConfig => {

  const md = markdown(eleventyConfig, {
    highlight: {
      block: ({ raw, language, escape }) => papyrus.highlight(raw, { language }),
      inline: ({ raw, language }) => papyrus.inline(raw, { language })
    },
    anchors: {
      attrs: [ ['spx-node', 'spy.anchor'] ],
      plugin: { /* plugin options */ }
    },
    options: {
      html: true,
      linkify: true,
      typographer: true,
      breaks: false
    }
  })

});
```

# Enhancements

The plugin provides a refined set of enhancements for both markdown and liquid.

- [Grid Container](#grid)
- [Syntax Highlighting](#syntax-highlighting)
- [Anchors](#anchors)
- [Blockquote](#blockquote)
- [Filters](#filters)

---

# Grid Container

Grid access is made possible using fenced containers in markdown. The `grid` keyword along with triple `:::` markers will result in encapsulate content being wrapped.

### Markdown Input

Use the minimum of 3 `:::` colon for open/close containers and 4 (or more) for nesting depths.

```md
:::: grid row jc-center ai-center

::: grid col-sm-6 col-md-4
Lorem ipsum dolor sit...
:::

::: grid col-6 col-md-8
Lorem ipsum dolor sit...
:::

::::
```

### Markup Output

The resulting output of the above will generate the following markup.

<!--prettier-ignore-->
```html
<div class="row jc-center ai-center">
  <div class="col-sm-6 col-md-4">
    Lorem ipsum dolor sit...
  </div>
  <div class="col-6 col-md-8">
    Lorem ipsum dolor sit...
  </div>
</div>
```

# Syntax Highlighting

Markdown codeblock regions will be passed to the `highlight` property and call either `block` or `inline` functions when structures are encountered. Designed for usage with [Papyrus](https://papyrus.js.org).

### Codeblock

Markdown codeblock will fire the `block()` method. Papyrus determines whether to render editor or not.

````md
```js
const foo = 'bar'; // Comment
```
````

### Inline Code

Papyrus support inline code highlighting and fires the `inline()` method. Signal inline code as follows:

```md
`{html} <h1>HTML</h1>`
`{js} someMethod()`
`{liquid} {% if %}`
```

> The single literal quotes with single whitespace to trigger inline highlighting, e.g: `{:language} code`

# Anchors

Link anchors support scroll-spy logic. This uses the [markdown-it-anchors](https://github.com/valeriangalliat/markdown-it-anchor#readme) plugin under the hood and provides an `attrs` helper for assigning additional attributes to heading blocks. The existence of and `anchors` array value contained in the frontmatter of a markdown page will determine whether or not anchor annotations apply.

### Frontmatter

The `anchors` frontmatter data will be used to generate the markup and also applies annotation to headings.

```md
---
anchors:
  Group Name:
    - Some Title
    - Another Title
  Second Group:
    - Foo
    - Bar
    - Baz
---

# Some Title
```

### Anchor Filter

Liquid output tags accept an `| anchor` filter which result in the `href` value being hash id.

| Syntax | Example                                                      |
| ------ | ------------------------------------------------------------ |
| Liquid | `<a href="{{ href \| anchor }}" spx-node="spy.href">Link<a>` |
| Markup | `<a href="#some-title" spx-node="spy.href">Link<a>`          |

### Heading Annotation

The heading values provided to frontmatter `anchors` will be matched and result in the following.

| Syntax   | Example                                                                   |
| -------- | ------------------------------------------------------------------------- |
| Markdown | `# Some Title`                                                            |
| Markup   | `<h1 id="some-title" tabindex="-1" spx-node="spy.anchor">Some Title</h1>` |

# Blockquote

Control the `class=""` values of blockquote occurrences within markdown. Whenever a blockquote begins with a colon prefixed value will be applied as the class name. For additional classes just append with space separators.

### Markdown Example

The `:class` annotation in markdown will simply add the class name/s.

```md
> :note
> This will be a note blockquote

---

> :warn
> This will be a warning blockquote
```

# Filters

An additional `| md` Liquid filter is made available. This `md` filter will apply inline rendering.

| Filter | Example             |
| ------ | ------------------- |
| `md`   | `{{ value \| md }}` |

### License

[Apache 2.0](#LICENSE)
