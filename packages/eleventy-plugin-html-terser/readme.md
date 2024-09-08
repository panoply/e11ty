# @e11ty/eleventy-plugin-html-terser

An [Eleventy](https://www.11ty.dev/) plugin for post-processing generated sites through the powerful [html-minifier-terser](https://terser.org/html-minifier-terser/).

### Why?

Because terser is dope and does dope shit.

# Install

The module requires [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) be installed along side it.

```cli
pnpm add 11ty-html-terser @11ty/eleventy -D
```

> The `@11ty/eleventy` module is a peer. You need to install it.

# Usage

Pass it to the `addPlugin` within a `.eleventy.js` or `.eleventy.cjs` configuration file. Optionally use with [11ty.ts](https://github.com/panoply/e11ty/plugins/11ty.ts) wrapper for type completions.

```ts
const { defineConfig } = require('11ty.ts'); // Optional
const { terser } = require('11ty-html-terser');

module.exports = defineConfig(eleventyConfig => {

  eleventyConfig.addPlugin(terser, {
    onlyProd: false, // Only Run when process.env.ENV === 'prod'
    terseOptions: {
      // Terser Options
    }
  })
})
```

See the available minification [options](https://terser.org/html-minifier-terser/) for `terserOptions`.

### License

[Apache 2.0](#LICENSE)
