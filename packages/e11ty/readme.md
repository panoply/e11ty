# e11ty

Shareable [Eleventy](https://www.11ty.dev/) configuration strap. The module acts as an interface, it exports various plugins that I maintain and use when leveraging 11ty.

# Install

Install as a development dependency. Plugins will be exposed as named exports. Consult each sub-directory or install the plugins in isolation.

```cli
pnpm add e11ty -D
```

# Usage

<!-- prettier-ignore -->
```js
const { defineConfig, markdown, search, terser } = require('e11ty');

module.exports = defineConfig(function (eleventyConfig) {

  markdown(eleventyConfig, {
    highlight: {
      fence: ({ raw, language, escape }) => '',
      block: ({ raw, language, escape }) => '',
      inline: ({ raw, language, escape }) => ''
    }
  });

  eleventyConfig.addPlugin(sprite, {});
  eleventyConfig.addPlugin(terser, {});
  eleventyConfig.addPlugin(search, {});

  return {};
});
```
