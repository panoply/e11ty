# e11ty

Shareable [Eleventy](https://www.11ty.dev/) configuration strap. This repository contains 11ty plugins I maintain and leverage when working on projects that use Eleventy as the static site builder.

### Types

Type support for Eleventy config files using a `defineConfig` wrapper

- [11ty.ts](/packages/11ty.ts)

### Straps

Shareable strap which exposes all plugins in this repository

- [e11ty](/packages/11ty.ts)

### Plugins

Plugins which can be installed in isolation on per-project basis.

- [@e11ty/eleventy-plugin-html-terser](/packages/eleventy-plugin-html-terser/)
- [@e11ty/eleventy-plugin-svg-sprite](/packages/eleventy-plugin-svg-sprite/)
- [@e11ty/eleventy-plugin-markdown](/packages/eleventy-plugin-markdown/)
- [@e11ty/eleventy-plugin-search-index](/packages/eleventy-plugin-search-index/)
