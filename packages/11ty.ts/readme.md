# 11ty.ts (Type Support)

Type support for [Eleventy](https://www.11ty.dev/) using `defineConfig` wrapper. This module can be dropped in to your `.eleventy.js` configuration file and will provide type support to the entire 11ty API, with JSDoc annotated descriptions and documentation linked references.

### Why?

Type support is assumed nowadays and when modules don't provide this basic capability it makes life difficult and reflects poorly on otherwise good projects (like Eleventy). The team behind Eleventy have floated type support but seem hesitant and from my understanding were considering using JSDoc types (We live in a society, We are not animals). The last time I actively looked in the issues it was clear and rather apparent that those discussing type support or working on it were not very well versed on the subject (imo).

##### References

- https://github.com/11ty/eleventy/issues/2317
- https://github.com/11ty/eleventy/pull/2091
- https://github.com/11ty/eleventy/pull/720
- https://github.com/11ty/eleventy/issues/814

# Install

The module requires [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) be installed along side it.

```cli
pnpm add 11ty.ts @11ty/eleventy -D
```

# Usage

Pass it to the `module.exports` within a `.eleventy.js` or `.eleventy.cjs` configuration file.

<!-- prettier-ignore -->
```ts
const eleventy = require("11ty.ts");

module.exports = eleventy(function(eleventyConfig) {

  config.addPlugin()

  return {
    htmlTemplateEngine: 'liquid',
    passthroughFileCopy: false,
    pathPrefix: '',
    templateFormats: [
      'liquid',
      'json',
      'md',
      'css',
      'html',
      'yaml'
    ],
    dir: {
      input: 'site',
      output: 'public',
      includes: 'views/include',
      layouts: 'views/layouts',
      data: 'data'
    }
  }
});
```

In addition to the default export, you may optionally prefer to use the `defineConfig` named export:

<!-- prettier-ignore-->
```ts
const { defineConfig } = require('11ty.ts');

module.exports = defineConfig(eleventyConfig => {

  // {}

})
```

# Auto-Typed Plugins

Eleventy plugins which provide typings within their distribution package will work if the syntactical structure of the plugin parameters apply options at index `1` of the argument order. The type utilities exposed in this module will convert the function parameters of plugins to a **tuple** and then reference the second argument, which is assumed to be the plugin options. It's far from an elegant approach, but due to the manner in which Eleventy digests plugins, this (for now) seems to be the only viable approach I've come up with.

### Example

For the sake of brevity, let's assume you've installed a plugin from the NPM register called `11ty-plugin-example` and this (fake) plugin has the following type declaration accompanied in the distribution package.

```ts
// Assuming the plugins uses this argument order
export function pluginName(eleventyConfig, options: {
  foo: string;
  bar: number;
  baz: boolean;
}) {

  // ...

}
```

This is rather typical and plugins which adhere to the above will be automatically typed. Using the `eleventyConfig.addPlugin` method will simply reference parameter `options` via tuple, so in your `.eleventy.js` file, completions will be applied when doing the following:

```ts
const { defineConfig } = require('11ty.ts');
const { pluginName } = require('11ty-plugin-example');

module.exports = defineConfig(eleventyConfig => {

  eleventyConfig.addPlugin(pluginName, {

    // Auto-typing will occur and intellisense completes
    // foo, bar and baz options.

  })

})
```


### License

[Apache 2.0](#LICENSE)
