const { defineConfig } = require('11ty.ts')

module.exports = defineConfig(eleventy => {

  eleventy.addShortcode('foo', function() {

    this.page.lang

  })

  return {
    dir: {
      data: ''
    }
  }
})