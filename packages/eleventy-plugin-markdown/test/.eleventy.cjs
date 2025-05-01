const { defineConfig, markdown } = require('e11ty');
const { search } = require('../dist/index.cjs');
const papyrus = require('papyrus')

module.exports = defineConfig(eleventyConfig => {


  const md = markdown(eleventyConfig, {
    highlight: {
      fence(options) {
        return options.language === 'js' ? `
          <h1>${options.language}</h1>
          <p>This will generate markup!</p>
          <pre>${options.raw.trim()}</pre>
        ` : papyrus.highlight(options.raw, {
          language: options.language
        })
      }
    },
    options: {
      html: true,
      linkify: true,
      typographer: true,
      breaks: false
    }
  });

  return {
    templateFormats: ['liquid', 'json', 'md', 'css', 'html', 'yaml'],
    dir: {
      output: 'public',
      input: 'src',
      layouts: 'layout'
    },

  }

})