# e11ty

Shareable [Eleventy](https://www.11ty.dev/) configuration strap. The module acts as an interface, it exports various plugins that I maintain and use when leveraging 11ty.

# Install

Install as a development dependency. Plugins will be pulled and exposed as named exports. Consult each sub-directory or install the plugins in isolation.

```cli
pnpm add e11ty -D
```

# Usage

```js
const { eleventy, markdown, sprite, terser } = require('e11ty');

module.exports = eleventy(function (eleventyConfig) {
  markdown(eleventyConfig, {});

  eleventyConfig.addPlugin(sprite, {});
  eleventyConfig.addPlugin(terser, {});

  return {};
});
```
