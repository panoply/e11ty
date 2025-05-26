import Slug, { slug } from 'github-slugger';

/**
 * E11ty Utitlites
 *
 * Various helper utilities for usage within Eleventy Config.
 */
export const util = {
  Slug,
  slug
};


export { defineConfig } from '11ty.ts';
export { terser } from '@e11ty/eleventy-plugin-html-terser';
export { sprite } from '@e11ty/eleventy-plugin-svg-sprite';
export { search, SearchContent, SearchHeading, SearchIndex, SearchPage } from '@e11ty/eleventy-plugin-search-index';
export { markdown } from '@e11ty/eleventy-plugin-markdown';
