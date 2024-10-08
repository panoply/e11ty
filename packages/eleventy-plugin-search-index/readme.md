# @e11ty/eleventy-plugin-search-index

An [Eleventy](https://www.11ty.dev/) plugin which generates search index JSON structures from markdown files. Use the output to implement an auto-complete search component which runs on the client.

> **NOTE**
>
> This plugin isn't universally compatible with all Eleventy static sites. It's tailored to my specific development approach, which means usage might require adjustments in certain contexts due to its particular requirements and methods.

# Install

The [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) module is a peer and needs to be installed along side it.

```cli
pnpm add @e11ty/eleventy-plugin-json-fusion -D
```

# Usage

Provide the plugin via `eleventyConfig` and handling options. The `onHeading` and `onText` methods will allow you to hook into the parse operations and give you control of the the generated JSON. You can manipulate the final structure using `onOutput` method before it is written.

> Optionally use with [11ty.ts](https://github.com/panoply/e11ty/packages/11ty.ts) wrapper for type completions.

<!-- prettier-ignore -->
```ts
const { defineConfig } = require('11ty.ts'); // Optional
const { search } = require('@e11ty/eleventy-plugin-search-index');

module.exports = defineConfig(eleventyConfig => {

  eleventyConfig.addPlugin(search, {
    shortCode:'search',
    output: '.',
    minify: false,
    stripHtml: true,    // Strips markup tags occurrences (ignores codeblocks)
    stripMarkdown: true, // Strips markdown syntax occurrences (ignores codeblocks)
    ignore: {
      syntax: [],   // Syntax (regexp) to ignore from processing
      heading: [],  // Headings (lowercase string) to ignore
    },
    codeblock: [
      'bash' // Process inner content of bash codeblocks
    ],
    content: [
      'text',  // Process all paragraph content
      'quote', // Process all blockquote content
      'list'   // Process all list content
    ],
    onHeading (heading) {
      // return string to replace
      // return false to skip
    },
    onContent (text) {
      // return string to replace
      // return false to skip
    },
    onOutput (json) {
      // Return new array to replace before writing
    }
  })

});
```

# Example

The plugin will generate a JSON file that includes an array of objects detailing the contents of markdown files. Each object must have a `title` and `permalink` in the frontmatter to be included; without these, the page's entry will not be created in the JSON output.

### Shortcode

In your layout file, incorporate the liquid shortcode. While you have the option to rename it, by default, it is set to `search`.

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

Given this markdown file, which includes the necessary frontmatter references along with content, the plugin will process it, convert it into an object, and include this object in the resulting array.

```md
---
title: 'Foo Page'
description: 'Hello World'
permalink: '/foo/index.html'
layout: 'base.liquid'
tags:
  - 'xxx'
---

# First Heading

Example text

### Second Heading

Lorem ipsum dolor
```

### JSON Output

Based on the above structure, the following search index will be created. It will include three properties: `pages`, `heading`, and `content`. Each of these properties is interconnected. Generally, you would utilize the `content[]` reference when integrating with your search client.

<!-- prettier-ignore -->
```jsonc
{
  "pages": [
    {
      "title": "Foo Page",
      "description": "Hello World",
      "url": "/foo/",
      "tags": ["xxx"],
      "pidx": 0,      // page index  (i.e, this index)
      "hidx": [0, 1], // heading indexes start and end location
      "cidx": [0, 3], // content indexes start and end location
    }
  ],
  "heading": [
    {
      "anchor": "/foo#first-heading",
      "pidx": 0,      // page index
      "hidx": 0,      // heading index (i.e, this index)
      "cidx": [0, 1], // content indexes start and end location
    },
    {
      "anchor": "/foo#second-heading",
      "pidx": 0,      // page index
      "hidx": 1,      // heading index (i.e, this index)
      "cidx": [2, 3], // content indexes start and end location
    }
  ],
  "content": [
    {
      "text": "Default Structure",
      "type": "heading",
      "sort": 1, // sort integer for filtering
      "cidx": 0, // content index (i.e, this index)
      "hidx": 0, // index of the heading entry within heading[]
      "pidx": 0, // index of the page entry within pages[]
    },
    {
      "text": "Example text",
      "type": "text", // the type of content
      "sort": 2, // sort integer for filtering
      "cidx": 1, // content index (i.e, this index)
      "hidx": 0, // index of the heading entry within heading[]
      "pidx": 0, // index of the page entry within pages[]
    },
    {
      "text": "Second heading",
      "type": "heading",
      "sort": 1, // sort integer for filtering
      "cidx": 2, // content index (i.e, this index)
      "hidx": 1, // index of the heading entry within heading[]
      "pidx": 0, // index of the page entry within pages[]
    },
    {
      "text": "Lorem ipsum dolor",
      "type": "text", // the type of content
      "sort": 1, // sort integer for filtering
      "cidx": 3, // content index (i.e, this index)
      "hidx": 1, // index of the heading entry within heading[]
      "pidx": 0, // index of the page entry within pages[]
    }
  ]
}
```

### Client Integration

This plugin was designed specifically to be used with a third party solution. The implementation on the client is not the job of this plugin, that logic is left up to you. For those seeking a rough example of how you can go about using the generated JSON output to create your own fuzzy-search can take a look at how I've done this using the static site framework I wrote called [spx](https://spx.js.org).

> **WARNING**
>
> SPX (15kb gzip) is a full fledged framework and not suitable for isolated usage, meaning you should not install SPX just to use this plugin but instead, use the linked examples as a reference.

### License

[Apache 2.0](#LICENSE)
