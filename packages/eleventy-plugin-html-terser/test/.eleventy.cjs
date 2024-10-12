const { defineConfig, search, markdown, terser } = require('e11ty');

module.exports = defineConfig(eleventyConfig => {

    const md = markdown(eleventyConfig, {
    options: {
      html: true,
      linkify: true,
      typographer: true,
      breaks: false
    }
  });

   eleventyConfig.addPlugin(search, {
    content: ['text'],
    ignore: {
      heading: ['creating components']
    },
    codeblock: ['base', 'js', 'html', 'ts'],
    onHeading: heading => md.renderInline(heading),
    onContent: content => md.renderInline(content),
   // onOutput: (json) => console.log(json[0].content.flatMap(({ content}) => content))
   })

  eleventyConfig.addPlugin(terser)

  return {
    dir: {
      output: 'public',
      input: 'src',
      layouts: 'layout'
    },

  }

})