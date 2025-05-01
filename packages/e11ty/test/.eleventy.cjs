const { defineConfig, markdown, sprite, terser } = require('e11ty');
const papyrus = require('papyrus');

module.exports = defineConfig(function (config) {

  // Markdown Intergration
  //
  // The syntax callback function will return the extracted
  // code block regions in .md files.
  markdown(config, {
    highlight: {
      block:({ raw, language }) => papyrus.highlight(raw, { language }),
      inline: ({ raw, language }) => papyrus.inline(raw, { language })
    },
    options: {
      breaks: true,
      html: true,
      linkify: false
    }
  })

  // Generates an SVG Sprite
  //
  config.addPlugin(sprite, { inputPath: 'src/assets/svg' });

  // Applied terse distribution when ENV equals "prod"
  // Pass in html-terser options as needed
  //
  config.addPlugin(terser, { prodOnly: false });

  // Example
  config.addPassthroughCopy('./src/assets/img/**')


  return {
    htmlTemplateEngine: 'liquid',
    passthroughFileCopy: false,
    pathPrefix: '',
    templateFormats: ['liquid', 'json', 'md', 'css', 'html', 'yaml'],
    dir: {
      input: 'src',
      output: 'public',
      includes: 'include',
      layouts: 'layout',
      data: ''
    },
  };
});
