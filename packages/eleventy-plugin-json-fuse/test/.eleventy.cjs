const { defineConfig, markdown, terser } = require('e11ty');
const { fuse } = require('@e11ty/eleventy-plugin-json-fuse');

module.exports = defineConfig(eleventyConfig => {

  const md = markdown(eleventyConfig, {
    options: {
      html: true,
      linkify: true,
      typographer: true,
      breaks: false
    }
  });

   eleventyConfig.addPlugin(fuse, {
    contentTypes: ['paragraph'],
    onHeading: heading => md.renderInline(heading),
    onText: text => md.renderInline(text)
   })

  return {
    dir: {
      output: 'public',
      input: 'src',
      layouts: 'layout'
    },

  }

})