
# 11ty-svg-sprite

Yet another [Eleventy](https://www.11ty.dev/) plugin for handling SVG files with [html-svg-sprite](https://github.com/svg-sprite/svg-sprite).

### Why?

Because the author that wrote an alternative is a pleb, so we hard-fork, refine and isolate. :trollface:

# Install

The module requires [@11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) be installed along side it.

```cli
pnpm add 11ty-svg-sprite @11ty/eleventy -D
```

> The `@11ty/eleventy` module is a peer. You need to install it.

# Usage

Pass it to the `addPlugin` within a `.eleventy.js` or `.eleventy.cjs` configuration file. Optionally use with [11ty.ts](https://github.com/panoply/e11ty/plugins/11ty.ts) wrapper for type completions.

<!-- prettier-ignore -->
```ts
const { defineConfig } = require('11ty.ts'); // Optional
const { sprite } = require('11ty-svg-sprite');

module.exports = defineConfig(eleventyConfig => {

  eleventyConfig.addPlugin(sprite, {
    inputPath: '',                  // Relative path to svg directory
    outputPath: '',                 // The output path of the SVG Sprite
    globalClass: '',                // Class name to apply to all SVG occurrences
    defaultClass: '',               // Fallback class applied to SVG icons
    spriteShortCode: 'sprite',      // The sprite short code, defaults to {% sprite %}/
    svgShortCode: 'svg',            // Icons tag, default to:  {% svg 'icon-name', 'custom-class' %}
    spriteConfig: {                 // SVGO Sprite configuration, below is defaults
      mode: {
        symbol: {
          inline: true,
          sprite: 'sprite.svg',
          example: false
        }
      },
      shape: {
        transform: [ 'svgo' ],
        id: {
          generator: 'svg-%s'
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
      }
    }
  });

});
```

There are 2 different short codes. Place the `sprite` short code in your template and use the `svg` short code tag to reference different icons.

```liquid
<body>

  {% sprite %}

</body>
```

You can inject the `<use>`reference using the `svg` short code within your project at different points, for example:

```liquid
<section>

  {% svg 'name-of-svg', 'custom-class' %}

</section>
```

### License

[Apache 2.0](#LICENSE)
