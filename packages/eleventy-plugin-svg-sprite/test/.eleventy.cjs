const { defineConfig } = require('11ty.ts');
const { sprite } = require('11ty-svg-sprite')

module.exports = defineConfig(eleventyConfig => {


  eleventyConfig.addPlugin(sprite, {

  })

  eleventyConfig.addPlugin(sprite, [
    {

    }
  ])

  return {
    dir: {},
    output: 'public',

  }

})