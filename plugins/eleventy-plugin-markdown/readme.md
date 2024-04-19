
# @e11ty/eleventy-plugin-markdown

An [Eleventy](https://www.11ty.dev/) plugin wrapped around [markdown-it](https://github.com/markdown-it/markdown-it) which exposed some basic logic used in the static sites I build leveraging 11ty.

# Install

The module requires [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) be installed along side it.

```cli
pnpm add @e11ty/eleventy-plugin-markdown -D
```

> The `@11ty/eleventy` module is a peer. You need to install it.

# Usage

The module includes markdown-it and papyrus in the build, it also has built in fenced containers for some custom structures within markdown. Optionally use with [11ty.ts](https://github.com/panoply/e11ty/plugins/11ty.ts) wrapper for type completions.

<!-- prettier-ignore -->
```ts
const { defineConfig } = require('11ty.ts'); // Optional
const { markdown } = require('@e11ty/eleventy-plugin-markdown');

module.exports = defineConfig(eleventyConfig => {

  markdown(eleventyConfig, {
    papyrus: {
      default: { /* Papyrus Syntax Defaults*/ },
      language: {
        liquid: { /* Papyrus Liquid Code Blocks */ },
      }
    },
    options: { /* options for markdown-it */ }
  })

});
```

### License

[Apache 2.0](#LICENSE)
