# @e11ty/eleventy-plugin-json-fuse

An [Eleventy](https://www.11ty.dev/) plugin which generates JSON structures from markdown files. Designed for usage with [Fuse.js](https://fusejs.io) or another independent auto-complete search module.

> **NOTE**
>
> This plugin isn't universally compatible with all Eleventy static sites. It's tailored to my specific development approach, which means its use might require adjustments in certain contexts due to its particular requirements and methods.

# Why?

Fuck algolia, that's why.

# Install

The module requires [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) be installed along side it.

```cli
pnpm add @e11ty/eleventy-plugin-json-fuse -D
```

> The `@11ty/eleventy` module is a peer. You need to install it.

# Usage

The module includes markdown-it and papyrus in the build, it also has built in fenced containers for some custom structures within markdown. Optionally use with [11ty.ts](https://github.com/panoply/e11ty/plugins/11ty.ts) wrapper for type completions.

<!-- prettier-ignore -->
```ts
const { defineConfig } = require('11ty.ts'); // Optional
const { fuse } = require('@e11ty/eleventy-plugin-json-fuse');

module.exports = defineConfig(eleventyConfig => {

  eleventyConfig.addPlugin(fuse, {
    output: '.',
    minify: false,
    shortCode:'search',
    syntaxIgnores: RegExp,
    headingIgnores: [],
    contentTypes: ['paragraph', 'blockquote', 'codeblock', 'list'],
    onHeading (heading) {
      // return string to replace
      // return false to skip
    },
    onText(text) {
      // return string to replace
      // return false to skip
    }
  })

});
```

# Example

The plugin will compose a JSON file containing an array list of objects that describe the contents of markdown files. Each page requires a frontmatter reference of `title` and `permalink` for a record to be created, failure to provide these will result in the page output not being generated.

### Shortcode

In your layout file, include the liquid shortcode. You can customise the shortcode name but it defaults to `search`

```liquid
<html>
  <head>
    <title>{{ title }}</title>
    <meta charset="UTF-8">
    <meta name="description" content="{{ description }}">
  </head>
  <body>

    {{ content }}

    {% search 'demo' %} {% # ← output filename: '_site/demo.json' %}

  </body>
</html>
```

### Markdown File

Take the following markdown file, we have provided the required frontmatter references and have some content. The plugin will read, parse and generate an object representation of the page and add it to the output array.

```md
---
title: 'Foo Page'
description: 'Hello World'
permalink: '/foo/index.html'
layout: 'layouts/base.liquid'
tags:
  - 'xxx'
---

# First Heading

Example text

### Second Heading

Lorem ipsum dolor
```

### JSON Output

Based on the above strucuture, the object record generated will take the following shape. The `content[]` array list will represent all **heading** → **paragraph** text structures. Each object in the generated output will be a page using the shortcode

<!-- prettier-ignore -->
```jsonc
[
  {
    "page": "Foo Page",               // Extracted from frontmatter title
    "description": "Hello World",      // Extracted from frontmatter description
    "url": "/foo",                    // Extracted from 11ty context this.page.url
    "tags": ["xxx"],                  // Extracted from frontmatter tags
    "content": [
      {
        "heading": "First Heading",    // Heading from a page markdown
        "text": "Example text",        // Content following the heading
        "url": "/foo#first-heading"    // Page url and anchor reference
      },
      {
        "heading": "Second heading",    // Heading from a page markdown
        "text": "Lorem ipsum dolor",    // Content following the heading
        "url": "/foo#second-heading"    // Page url and anchor reference
      }
    ]
  }
]
```

### Using [Fuse](https://www.fusejs.io) with [SPX](https://spx.js.org)

This plugin was designed specifically to be used with [fuse.js](https://www.fusejs.io). The implementation with fuse is not the job of this plugin, that logic is left upto you. For those seeking a rough example of how you can go about using the generated JSON output to create your own fuzzy-search can take a look at how I've done this using the static site framework I wrote called [spx](https://spx.js.org).

> **WARNING**
>
> SPX (15kb gzip) is a full fledged framework and not suitable for isolated usage, meaning you should not install SPX just to use this plugin but instead, use the linked examples as a reference.

### License

[Apache 2.0](#LICENSE)
