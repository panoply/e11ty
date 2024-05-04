export { defineConfig as eleventy } from '11ty.ts';
export { terser } from '@e11ty/eleventy-plugin-html-terser';
export { sprite } from '@e11ty/eleventy-plugin-svg-sprite';
export { markdown } from '@e11ty/eleventy-plugin-markdown';

/**
 * Generate a slug.
 *
 * Does not track previously generated slugs: repeated calls with the same value
 * will result in the exact same slug.
 * Use the `GithubSlugger` class to get unique slugs.
 *
 * @param  {string} value
 *   String of text to slugify
 * @param  {boolean} [maintainCase=false]
 *   Keep the current case, otherwise make all lowercase
 * @return {string}
 *   A unique slug string
 */
declare function slug(value: string, maintainCase?: boolean | undefined): string;
/**
 * Slugger.
 */
declare class BananaSlug {
    /** @type {Record<string, number>} */
    occurrences: Record<string, number>;
    /**
     * Generate a unique slug.
    *
    * Tracks previously generated slugs: repeated calls with the same value
    * will result in different slugs.
    * Use the `slug` function to get same slugs.
     *
     * @param  {string} value
     *   String of text to slugify
     * @param  {boolean} [maintainCase=false]
     *   Keep the current case, otherwise make all lowercase
     * @return {string}
     *   A unique slug string
     */
    slug(value: string, maintainCase?: boolean | undefined): string;
    /**
     * Reset - Forget all previous slugs
     *
     * @return void
     */
    reset(): void;
}

/**
 * E11ty Utitlites
 *
 * Various helper utilities for usage within Eleventy Config.
 */
declare const util: {
    Slug: typeof BananaSlug;
    slug: typeof slug;
};

export { util };
