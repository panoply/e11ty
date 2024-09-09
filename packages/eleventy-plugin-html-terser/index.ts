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
  options: TerserOptions = {
    runModes: [],
    terserOptions: {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeRedundantAttributes: true
    }
  }
) {

  eleventy.namespace('html-terser', () => {
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

        const SEP = '\n\n------------------------------------------------------------\n\n';

        console.error(
          SEP,
          ' HTML TERSER ERROR\n\n',
          error,
          SEP
        );

      }

      return content;

    });

  });

};
