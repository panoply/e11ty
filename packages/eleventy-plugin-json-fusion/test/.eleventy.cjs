const { defineConfig, markdown } = require('e11ty');
const { fusion } = require('@e11ty/eleventy-plugin-json-fusion');

module.exports = defineConfig(eleventyConfig => {

  const md = markdown(eleventyConfig, {
    options: {
      html: true,
      linkify: true,
      typographer: true,
      breaks: false
    }
  });

   eleventyConfig.addPlugin(fusion, {
    content: ['paragraph'],

    ignore: {
      heading: ['creating components']
    },
    codeblock: ['base', 'js', 'html', 'ts'],
    onHeading: heading => md.renderInline(heading),
    onContent: content => md.renderInline(content),
   // onOutput: (json) => console.log(json[0].content.flatMap(({ content}) => content))
   })

  return {
    dir: {
      output: 'public',
      input: 'src',
      layouts: 'layout'
    },

  }

})