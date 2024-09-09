const { defineConfig } = require('11ty.ts');
const { terser } = require('@e11ty/eleventy-plugin-html-terser');
const activityPubPlugin = require('eleventy-plugin-activity-pub');
const lazyImages = require('eleventy-plugin-lazyimages')

module.exports = defineConfig(eleventyConfig => {


  eleventyConfig.addPlugin(terser, {
    runModes: [],
    terserOptions: {
      caseSensitive: true,
    }
   })


  // PLUGIN HAS NO TYPES
  eleventy.addPlugin(lazyImages, { no_types  })

  return {
    dir: {},
    output: 'public',

  }

})