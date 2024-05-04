import type { EleventyConfig } from '11ty.ts';
import { minify, Options } from 'html-minifier-terser';

interface TerserOptions {
  /**
   * Only Run when `process.env.ENV` equals `prod`
   *
   * @default false
   */
  prodOnly?: boolean;
  /**
   * Options to pass to Terser
   */
  terserOptions?: Options
}

export function terser (
  eleventy: EleventyConfig,
  options: TerserOptions = {
    prodOnly: false,
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
    eleventy.addTransform('html-terser', async function (
      content: string,
      outputPath: string
    ) {

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
