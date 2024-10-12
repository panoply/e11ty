import type { EleventyConfig } from '11ty.ts';
import { minify, Options } from 'html-minifier-terser';

type RunModes = 'watch' | 'build' | 'serve'
interface TerserOptions {
  /**
   * @deprecated use `runModes` instead.
   */
  onlyProd?: boolean;
  /**
   * Optionally choose the run modes to apply minification.
   * Eleventy supports 3 different run modes:
   *
   * - `watch`
   * - `build`
   * - `serve`
   *
   * By default, minification will be applied in all modes.
   *
   * @default
   * ['watch', 'build', 'serve']
   * @example
   * // only applies minification in build mode
   * { runModes: ['build'] }
   */
  runModes?: RunModes[];
  /**
   * Options to pass to Terser
   */
  terserOptions?: Options
}

export function terser (
  eleventy: EleventyConfig,
  options: TerserOptions = {}
) {

  const defaults: Options = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    removeRedundantAttributes: true,
    ignoreCustomFragments: [
      ///<pre[\s\S]*?<\/pre>/,
    ],
  }

  if(!options?.runModes) {
    options.runModes = []
  }

  if(!options?.terserOptions) {
    options.terserOptions = Object.assign(defaults, options.terserOptions)
  } else {
    options.terserOptions = defaults
  }

  eleventy.addTransform('html-terser', async function (content: string, outputPath: string) {

    if (options?.runModes.length > 0) {
      if (!options?.runModes.includes(this.eleventy.env.runMode)) {
        return content
      }
    }

    try {

      if (outputPath?.endsWith('.html')) {
        const minified = await minify(content, options.terserOptions);
        return minified;
      }

    } catch (error) {

      const SEP = '\n\n\x1b[90m------------------------------------------------------------\x1b[0m\n\n';

      console.error(
        SEP,
        '\x1b[1;31mHTML TERSER ERROR\x1b[0m\n\n',
        error.message.slice(0, 300),
        '\n\n\x1b[1;90m TIP!\x1b[0m',
        '\n \x1b[90mYou might resolve this by enabling \x1b[1;90mcontinueOnParseError\x1b[0m,\x1b[90m e.g:\n\n  {\n    \x1b[0m\x1b[34mterserSettings\x1b[0m\x1b[90m: {\n      \x1b[0m\x1b[34mcontinueOnParseError\x1b[0m\x1b[90m:\x1b[0m \x1b[1;32mtrue\x1b[0m\n    \x1b[90m}\n  }\x1b[0m\x1b.',
        SEP
      );

    }

    return content;

  });



};
