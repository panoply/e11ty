# e11ty

Shareable [Eleventy](https://www.11ty.dev/) configuration strap. The module acts as an interface, it exports various plugins used in the project I write using Eleventy.

# Install

Use this alongside [@panoply/11ty](https://github.com/panoply/11ty) for type completions.

```cli
pnpm add @sissel/11ty -D
```

# Usage

This is CJS module because 11ty is not ESM. Use it within a `.eleventy.js` or `.eleventy.cjs` configuration file and pass it to `module.exports`. The package comes with some essential plugins included.

<!-- prettier-ignore -->
```ts
const { eleventy, markdown, terser, sprite, versions } = require("e11ty");

module.exports = eleventy(function(config) {

  // Markdown Integration
  // The syntax callback function will return the extracted code block regions in .md files
  markdown(config, {})

  // Generates an SVG Sprite using SVG Sprite. The maintainer of the
  // official eleventy plugin is a bitch, so we merely expand upon his
  // shitty work and make things cleaner in this variation
  //
  config.addPlugin(sprite, { inputPath: 'src/assets/svg' });

  // Applied terse distribution when ENV equals "prod"
  // Pass in html-terser options as needed, there are a bunch of
  // standard defaults I've applied
  //
  config.addPlugin(terser, { prodOnly: true });

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

### License

[MIT](#LICENSE)
