# @e11ty/eleventy-plugin-html-terser

An [Eleventy](https://www.11ty.dev/) plugin for post-processing generated sites through the powerful [html-minifier-terser](https://terser.org/html-minifier-terser/).

### Why?

Because terser is dope and does dope shit.

# Install

The [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) module is a peer and needs to be installed along side it.

```cli
pnpm add @e11ty/eleventy-plugin-html-terser @11ty/eleventy -D
```

# Usage

Pass to the `addPlugin` method of `eleventyConfig` within a `.eleventy.js` or `.eleventy.cjs` configuration file. You can provide terser options to the `terserOption` property, which will use the defaults listed below. The `runModes[]` option allows you to (optionally) control modes that minification applies (defaults to all run modes).

> Optionally use with [11ty.ts](https://github.com/panoply/e11ty/packages/11ty.ts) wrapper for type completions.

<!-- prettier-ignore -->
```ts
const { defineConfig } = require('11ty.ts'); // Optional
const { terser } = require('@e11ty/eleventy-plugin-html-terser');

module.exports = defineConfig(eleventyConfig => {

  eleventyConfig.addPlugin(terser, {
    runModes: [], // Optionally specify the run modes for minification
    terserOptions: {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeRedundantAttributes: true
    }
  });

});
```

See the available minification [options](https://terser.org/html-minifier-terser/) for terser.

### License

[Apache 2.0](#LICENSE)
