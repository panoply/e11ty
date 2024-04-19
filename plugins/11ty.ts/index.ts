import type { Join, LiteralUnion } from 'type-fest';
import type { WatchOptions } from 'chokidar';

type TemplateEngines = LiteralUnion<(
  | 'html'
  | 'md'
  | '11ty.js'
  | 'liquid'
  | 'njk'
  | 'hbs'
  | 'mustache'
  | 'ejs'
  | 'haml'
  | 'pug'
  | 'jstl'
), string>;

type EventNamesDeprecated = LiteralUnion<(
  | 'beforeBuild'
  | 'beforeWatch'
  | 'afterBuild'
), string>;

type EventNames = LiteralUnion<(
  | 'eleventy.before'
  | 'eleventy.after'
  | 'eleventy.beforeWatch'
), string>;

type AsyncFilter = (error: unknown | null, result?: any) => void;

/**
 * Eleventy Plugin
 *
 * Typical argument order structure of an Eleventy plugin
 */
type EleventyPlugin = (eleventy: any, options?: any) => any;

/**
 * Eleventy Plugin Options
 *
 * Plugin options are obtains by cherry-picking the parameter
 * tuple type. It is assumed plugin options are at index 1.
 */
type GetPluginOptions<T extends EleventyPlugin> = Parameters<T>[1];

interface PluginExtend {
  /**
   * Add an Eleventy Plugin.
   *
   * Plugins are custom code that Eleventy can import into a project
   * from an external repository.
   *
   * [11ty Docs](https://www.11ty.dev/docs/plugins/)
   */
  addPlugin<Plugin extends EleventyPlugin, PluginOptions extends GetPluginOptions<Plugin>>(
    plugin: Plugin,
    options?: PluginOptions
  ): void;
}

interface EleventyPage {
  /**
   * URL can be used in `<a href>` to link to other templates.
   *
   * > **NOTE:**
   * >
   * > This value will be `false` if `permalink` is set to `false`.
   *
   * @example
   * "/current/page/myFile/"
   */
  url: string;
  /**
   * For permalinks: inputPath filename minus template file extension.
   *
   * @example
   * "myFile"
   */
  fileSlug: string;
  /**
   * For permalinks: inputPath minus template file extension.
   *
   * @example
   * "/current/page/myFile"
   */
  filePathStem: string;
  /**
   * JS Date object for current page (used to sort collections).
   */
  date: Date;
  /**
   * The path to the original source file for the template.
   *
   * > **NOTE:**
   * >
   * > this includes your input directory path!
   *
   * @example
   * "./current/page/myFile.md"
   */
  inputPath: string;
  /**
   * Depends on your output directory (the default is `_site`).
   * You should probably use `url` instead.
   *
   *
   * > **NOTE:**
   * >
   * > This value will be `false` if `permalink` is set to `false`.
   *
   * @example
   * "./_site/current/page/myFile/index.html"
   */
  outputPath: string | false;
  /**
   * Useful with `page.filePathStem` when using custom file extensions.
   */
  outputFileExtension: string;
  /**
   * Comma separated list of template syntaxes processing this template.
   *
   * @example
   * "liquid,md"
   */
  templateSyntax: string;
  /**
   * The default is the value of `defaultLanguage` passed to the i18n plugin.
   *
   * > **NOTE:**
   * >
   * > Note that `page.lang` is only available when the [i18n plugin](https://www.11ty.dev/docs/plugins/i18n/#add-to-your-configuration-file) has been added to your configuration file.
   */
  lang: string;
}

interface EleventyData {
  /**
   * Eleventy version
   */
  version: string;
  /**
   * For use with `<meta name="generator">`
   */
  generator: string;
  /**
   * Environment Variables
   *
   * [11ty Docs](https://www.11ty.dev/docs/environment-vars/#eleventy-supplied)
   */
  env: {
    /**
     * Absolute path to the directory in which you've run the Eleventy command.
     *
     * @example
     * "1.0.1"
     */
    root: string;
    /**
     * Absolute path to the current config file
     *
     * @example
     * '/Users/zachleat/myProject/.eleventy.js'
     */
    config: string;
    /**
     * The method, either `cli` or `script`
     */
    source: 'cli' | 'script';
    /**
     * One of `serve`, `watch`, or `build`
     */
    runMode: 'serve' | 'watch' | 'build';
  };
  serverless: {
    /**
     * An object containing the values from any Dynamic URL
     * slugs from Serverless paths
     *
     * For Example:
     *
     * A slug for `/path/:id/` and a URL for `/path/1/` would give:
     *
     * @example
     * { id: 1 }
     */
    path: {
        [key: string]: any;
    };
    /**
     * The `event.queryStringParameters` received from the
     * serverless function. Note these are not available in Netlify On-demand Builders
     *
     * @example
     *
     * // ?id=1
     * { id: 1 }
     */
    query: {
        [key: string]: any;
    };
  };
}

interface EleventyScope {
  /**
   *
   * Information about the current page (see the code block below for page contents).
   * For example, page.url is useful for finding the current page in a collection.
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#page-variable)
   */
  page: EleventyPage;
  /**
   * Contains Eleventy-specific data from environment variables and the Serverless plugin (if used).
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#eleventy-variable)
   */
  eleventy: EleventyData;
}

interface EleventyServer {
  /**
   * Whether the live reload snippet is used.
   */
  liveReload?: boolean;
  /**
   * Whether DOM diffing updates are applied where possible instead of page reloads.
   */
  domDiff?: boolean;
  /**
   * The starting port number. Will increment up to (configurable) 10 times if a port is already in use.
   */
  port?: number;
  /**
   * Additional files to watch that will trigger server updates.
   * Accepts an Array of file paths or globs (passed to `chokidar.watch`).
   */
  watch?: string[];
  /**
   * Show local network IP addresses for device testing.
   */
  showAllHosts?: boolean;
  /**
   * Use a local key/certificate to opt-in to local HTTP/2 with https.
   */
  https?: {
      key?: string;
      cert?: string;
  };
  /**
   * Change the default file encoding for reading/serving files.
   */
  encoding?: string;
  /**
   * Show the dev server version number on the command line.
   */
  showVersion?: boolean;
  /**
   * Change the name of the folder name used for injected scripts.
   */
  injectedScriptsFolder?: string;
  /**
   * Number of times to increment a port if already in use.
   */
  portReassignmentRetryCount?: number;
  /**
   * Alias for backwards compatibility, renamed to `injectedScriptsFolder` in Dev Server 1.0+.
   */
  folder?: string;
  /**
   * Alias for backwards compatibility, renamed to `liveReload` in Dev Server 1.0+.
   */
  enabled?: boolean;
  /**
   * Alias for backwards compatibility, renamed to `domDiff` in Dev Server 1.0+.
   */
  domdiff?: boolean;
}

interface EleventyBrowserSync extends EleventyServer {
  /**
   * You can swap back to Eleventy Dev Server using the `setServerOptions` configuration API
   * and the [@11ty/eleventy-server-browsersync](https://github.com/11ty/eleventy-server-browsersync) package.
   */
  module: LiteralUnion<'@11ty/eleventy-server-browsersync', string>;
  /**
   * Opt-out of the Browsersync snippet
   */
  snippet?: boolean;
}

interface EleventDataExtension {
  /**
   * The callback function used to parse the data.
   *
   * @param {string} contents - The data file's contents (unless read: false).
   * @param {string} filePath - The file path.
   * @returns {Record<string, any>} Parsed data.
   */
  parser: (contents: string, filePath: string) => Record<string, any>;
  /**
   * Whether to read the file contents or just the file path.
   *
   * @default true
   */
  read?: boolean;
  /**
   * The encoding of Node's readFile.
   *
   * @default "utf8"
   */
  encoding?: string | null;
}

interface Filters {
  /**
   * Liquid Filter
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/)
   */
  addLiquidFilter(
    filterName: string,
    filter: (this: EleventyScope, ...args: any[]) => string): void;
  /**
   * Handlebars Filter
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/)
   */
  addHandlebarsHelper(
    filterName: string,
    filter: (this: EleventyScope, ...args: any[]) => string): void;
  /**
   * JavaScript Function Filter
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/)
   */
  addJavaScriptFunction(
    filterName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Nunjucks Async Filter
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/)
   */
  addNunjucksFilter(
    filterName: string,
    filter: (this: EleventyScope, ...args: any[]) => string): void;
  /**
   * Nunjucks Async Filter
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/)
   */
  addNunjucksAsyncFilter(
    filterName: string,
    filter: (this: EleventyScope, callback: AsyncFilter) => void): void;
  /**
   * Nunjucks Async Filter
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/)
   */
  addNunjucksAsyncFilter(
    filterName: string,
    filter: (this: EleventyScope, arg: any, callback: AsyncFilter) => void): void;
  /**
   * Nunjucks Async Filter
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/)
   */
  addNunjucksAsyncFilter(
    filterName: string,
    filter: (this: EleventyScope, arg1: any, arg2: any, callback: AsyncFilter) => void): void;
}

interface ShortCodes {
  /**
   * Liquid Sortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addLiquidShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Nunjucks Sortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addNunjucksShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Handlebars Sortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addHandlebarsShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string): void;
  /**
   * JavaScript Function Sortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addJavaScriptFunction(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Liquid Paired Sortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes)
   */
  addPairedLiquidShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, content: string, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Nunjucks Paired Sortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes)
   */
  addPairedNunjucksShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, content: string, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   *Handlebars Paired Sortcode
    *
    * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes)
    */
  addPairedHandlebarsShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, content: string, ...args: any[]) => string): void;
}

/**
 * [Eleventy](https://www.11ty.dev/)
 *
 * A simpler static site generator.
 */
export interface EleventyConfig extends Filters, ShortCodes, PluginExtend {
  [method: string]: any;

  /**
   * In order to maximize user-friendliness to beginners,
   * Eleventy will show each file it processes and the output file.
   * To disable this noisy console output, use quiet mode!
   *
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#enable-quiet-mode-to-reduce-console-noise)
   *
   * ---
   *
   * **Example**
   *
   * ```js
   * const eleventy = require('11ty.ts');
   *
   * module.exports = function (eleventyConfig) {
   *   eleventyConfig.setQuietMode(true);
   * };
   *
   *
   * ```
   *
   * @default false
   */
  setQuietMode(quiet: boolean): void;
  /**
   * Namespace
   *
   * It's unlikely you’ll need this feature but you can namespace parts of your configuration
   * using `eleventyConfig.namespace`. This will add a string prefix to all filters,
   * tags, helpers, shortcodes, collections, and transforms.
   *
   * > **WARNING**
   * >
   * > Plugin namespacing is an application feature and should not be used if you are
   * > creating your own plugin (in your plugin configuration code). Follow along at
   * > Issue [#256](https://github.com/11ty/eleventy/issues/256).
   *
   * [11ty Docs](https://www.11ty.dev/docs/plugins/#plugin-configuration-options)
   */
  namespace(prefix: string, callback: () => any): void
  /**
   * 11ty Dev Server
   *
   * You can configure the server with the configuration API method.
   *
   * [11ty Docs](https://www.11ty.dev/docs/dev-server)
   */
  setServerOptions: {
    (options: EleventyServer): void;
    (options: EleventyBrowserSync): void;
  };
  /**
   * Advanced chokidar options API method.
   *
   * [11ty Docs](https://www.11ty.dev/docs/dev-server/#advanced-chokidar-options)
   */
  setChokidarConfig(options: WatchOptions): void;
  /**
   * Specify which types of templates should be transformed.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#template-formats)
   *
   */
  setTemplateFormats(formats: readonly TemplateEngines[] | Join<TemplateEngines[], ','>): void;
  /**
   * Use a full deep merge when combining the Data Cascade.
   * This will use something similar to lodash.mergewith to
   * combine Arrays and deep merge Objects, rather than a simple
   * top-level merge using `Object.assign`
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-deep-merge/)
   *
   * _As of Eleventy **1.0** this defaults to enabled (but API still exists for opt-out)._
   *
   */
  setDataDeepMerge(deepMerge: boolean): void;
  /**
   * Customize front matter parsing
   */
  setFrontMatterParsingOptions(options: any): void;
  /**
   * Watch JavaScript Dependencies
   *
   * When in `--watch` mode, Eleventy will spider the dependencies
   * of your JavaScript Templates (_.11ty.js_), JavaScript Data Files
   * or Configuration File (usually _.eleventy.js_)
   * to watch those files too.
   *
   * Files in node_modules directories are ignored. This feature is enabled by default.
   *
   * [11ty Docs](https://www.11ty.dev/docs/watch-serve/#watch-javascript-dependencies)
   */
  setWatchJavaScriptDependencies(watch: boolean): void;
  /**
   * Change Base File Name for Data Files
   *
   * Looks for index.json and index.11tydata.json instead of using folder names
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#change-base-file-name-for-data-files)
   */
  setDataFileBaseName(name: string): void;
  /**
   * Custom Data File Formats
   *
   * Out of the box, Eleventy supports arbitrary JavaScript and JSON for both template and
   * directory data files as well as global data.
   *
   * Maybe you want to add support for TOML or YAML too! Any text format will do.
   *
   * > **NOTE**
   * >
   * > You can also add Custom Front Matter Formats as well.
   *
   * ---
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-custom/)
   *
   *
   * ```
   */
  addDataExtension(
    fileExtension: string,
    callback: (this: EleventyScope, contents: any, filePath?: string) => EleventDataExtension): void;
  /**
   *
   * When using Template and Directory Specific Data Files, to prevent file name conflicts
   * with non-Eleventy files in the project directory, we scope these files with a unique-to-Eleventy
   * suffix. This suffix is customizable using the `setDataFileSuffixes` configuration API method.
   *
   * For example, using `".11tydata"` will search for `*.11tydata.js` and `*.11tydata.json` data files.
   * The empty string (`""`) here represents a file without a suffix—and this entry only applies to
   * `*.json` data files.
   *
   * This feature can also be used to disable Template and Directory Data Files altogether with
   * an empty array (`[]`).
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#change-file-suffix-for-data-files)
   *
   * ---
   *
   * **Example**
   *
   * ```js
   * const eleventy = require('11ty.ts');
   *
   * module.exports = eleventy(function (eleventyConfig) {
   *
   *  // e.g. file.json and file.11tydata.json
   *  eleventyConfig.setDataFileSuffixes([".11tydata", ""]);
   *
   *  // e.g. file.11tydata.json
   *  eleventyConfig.setDataFileSuffixes([".11tydata"]);
   *
   *  // No data files are used.
   *  eleventyConfig.setDataFileSuffixes([]);
   * });
   *
   *
   * ```
   */
  setDataFileSuffixes(files: string[]): void;
  /**
   * > **DEPRECATED**
   * >
   * > _This only applies to Eleventy **1.x** and **0.x** and will be removed when
   * Eleventy **2.0** is stable. If you want to use Browsersync with Eleventy **2.0**,
   * learn how to [swap back to BrowserSync](https://www.11ty.dev/docs/watch-serve/#swap-back-to-browsersync)_
   *
   * ---
   *
   * Override BrowserSync Server Options
   *
   * Useful if you want to change or override the default Browsersync configuration.
   * Find the Eleventy defaults in EleventyServe.js. Take special note that Eleventy
   * does not use Browsersync’s watch options and trigger reloads manually after our
   * own internal watch methods are complete.
   *
   * [11ty Docs](https://www.11ty.dev/docs/watch-serve/#override-browsersync-server-options)
   *
   * @deprecated
   */
  setBrowserSyncConfig(browserSyncOptions: any): void;
  /**
   * Add Delay Before Re-Running
   *
   * A hardcoded amount of time Eleventy will wait before triggering a new build
   * when files have changes during --watch or --serve modes. You probably won’t
   * need this, but is useful in some edge cases with other task runners (Gulp, Grunt, etc).
   *
   * [11ty Docs](https://www.11ty.dev/docs/watch-serve/#add-delay-before-re-running)
   *
   * ---
   *
   * @default 0
   */
  setWatchThrottleWaitTime(ms: number): void;
  /**
   * Add Your Own Watch Targets
   *
   * The `addWatchTarget` config method allows you to manually add a
   * file or directory for Eleventy to watch. When the file or the
   * files in this directory change Eleventy will trigger a build.
   * This is useful if Eleventy is not directly aware of any external
   * file dependencies.
   *
   * [11ty Docs](https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets)
   */
  addWatchTarget(target: string): void;
  /**
   * Opt-out of using .gitignore
   *
   * You can disable automatic use of your `.gitignore` file. When using
   * `.gitignore` is disabled, `.eleventyignore` will be the single source
   * of truth for ignored files. This also means that your `node_modules`
   * directory will be processed unless otherwise specified in your
   * `.eleventyignore` file.
   *
   * [11ty Docs](https://www.11ty.dev/docs/ignores/#opt-out-of-using-.gitignore)
   */
  setUseGitIgnore(use: boolean): void;
  /**
   * You can programmatically add and delete ignores in your configuration file.
   *
   * [11ty Docs](https://www.11ty.dev/docs/ignores/#configuration-api)
   */
  ignores: Set<string>;
  /**
   * Transforms
   *
   * These used to be called Filters but were renamed to Transforms to
   * avoid confusion with Template Language Filters. Transforms can modify
   * a template’s output. For example, use a transform to format/prettify
   * an HTML file with proper whitespace. The provided transform function
   * must return the original or transformed content.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#transforms)
   */
  addTransform(
    name: string,
     transform: (this: EleventyScope, content: string, outputPath: string) => string | PromiseLike<string>): void;
  /**
   * Linters
   *
   * Similar to Transforms, Linters are provided to analyze a template's
   * output without modifying it.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#linters)
   */
  addLinter(
    name: string,
    linter: (this: EleventyScope, content: string, inputPath: string, outputPath: string) => void): void;
  /**
   * A Set of lodash selectors that allow you to include data from the
   * data cascade in the output from `--to=json`, `--to=ndjson`, or the
   * `EleventyServerless.prototype.getOutput` method.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#data-filter-selectors)
   *
   * _This will now include a data property in your JSON output that
   * includes the page variable for each matching template_
   */
  dataFilterSelectors: Set<string>;
  /**
   * If we want to copy additional files that are not Eleventy templates,
   * we use a feature called Passthrough File Copy to tell Eleventy to copy
   * things to our output folder for us.
   *
   * Passthrough File Copy entries are relative to the root of your project
   * and not your Eleventy input directory.
   *
   * [11ty Docs](https://www.11ty.dev/docs/copy/)
   *
   * ---
   *
   * **Example**
   *
   * ```js
   * const eleventy = require('11ty.ts');
   *
   * module.exports = eleventy(function (eleventyConfig) {
   *
   *   // Output directory: _site
   *
   *   // Copy `img/` to `_site/img`
   *   eleventyConfig.addPassthroughCopy("img");
   *
   *   // Copy `css/fonts/` to `_site/css/fonts`
   *   // Keeps the same directory structure.
   *   eleventyConfig.addPassthroughCopy("css/fonts");
   *
   *   // Copy any .jpg file to `_site`, via Glob pattern
   *   // Keeps the same directory structure.
   *   eleventyConfig.addPassthroughCopy("*.jpg");
   * });
   *```
    */
  addPassthroughCopy(path: string | {
      [input: string]: string;
  }): void;
  /**
   * Universal filters can be added in a single place and are available to
   * multiple template engines, simultaneously. This is currently supported
   * in JavaScript, Nunjucks, Liquid, and Handlebars.
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/#filters)
   */
  addFilter(
    filterName: string,
    filter: (this: EleventyScope, ...args: any[]) => string): void;
  /**
   * If you’d like to reuse existing filters in a different way, consider
   * using the new Configuration API getFilter method. You can use this
   * to alias a filter to a different name. You can use this to use a filter
   * inside of your own filter. You can use this to use a filter inside of a shortcode.
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/#access-existing-filters)
   */
  getFilter(filterName: string): (...args: any[]) => string;
  /**
   * Various template engines can be extended with shortcodes for easy reusable content.
   * This is sugar around Template Language Custom Tags. Shortcodes are supported in
   * JavaScript, Liquid, Nunjucks, Handlebars templates.
   *
   * Markdown files are pre-processed as Liquid templates by default. This means that
   * shortcodes available in Liquid templates are also available in Markdown files.
   * Likewise, if you change the template engine for Markdown files, the shortcodes
   * available for that templating language will also be available in Markdown files
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   *
   */
  addShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * The real ultimate power of Shortcodes comes when they are paired.
   * Paired Shortcodes have a start and end tag—and allow you to nest other template
   * content inside!
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes)
   */
  addPairedShortcode(
    pairedShortcodeName: string,
    filter: (this: EleventyScope, content: string, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Pass in your own instance of the Markdown library
   *
   * [11ty Docs](https://www.11ty.dev/docs/languages/markdown/#optional-set-your-own-library-instance)
   */
  setLibrary(name: string, instance: any): void;
  /**
   * You may want to run some code at certain times during the compiling process.
   * To do that, you can use configuration events, which will run at specific times
   * during the compiling process.
   *
   * [11ty Docs](https://www.11ty.dev/docs/events/)
   */
  on(event: EventNames, handler: () => void): void;
  /**
   * Deprecated Event Name, Use the new Event names:
   *
   * - `eleventy.before`
   * - `eleventy.after`
   * - `eleventy.beforeWatch`
   *
   * [11ty Docs](https://www.11ty.dev/docs/events/)
   *
   * @deprecated
   */
  on(event: EventNamesDeprecated, handler: () => void): void;
}

interface ReturnConfig {
  dir?: {
    /**
     * Input directory
     */
    input?: string;
    /**
     * Output directory
     */
    output?: string;
    /**
     * Directory for includes
     */
    includes?: string;
    /**
     * Directory for layouts
     */
    layouts?: string;
    /**
     * Directory for global data files
     */
    data?: string;
  };
  /**
   * Default template engine for global data files
   */
  dataTemplateEngine?: TemplateEngines | false;
  /**
   * Default template engine for markdown files
   */
  markdownTemplateEngine?: TemplateEngines | false;
  /**
   * Default template engine for HTML files
   */
  htmlTemplateEngine?: TemplateEngines | false;
  /**
   * Template formats that should be transformed
   */
  templateFormats?: string | string[];
  /**
   * URL path prefix
   */
  pathPrefix?: string;
  /**
   * Suffix that will be added to output files if `dir.input` and `dir.output` match.
   *
   * If an HTML template has matching input and output directories, `index.html` files will
   * have this suffix added to their output filename to prevent overwriting the template.
   * Read more at the [HTML template docs](https://www.11ty.dev/docs/languages/html/).
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#change-exception-case-suffix-for-html-files)
   */
  htmlOutputSuffix?: string;
  /**
   * Set file suffix for template and directory specific data files.
   */
  jsDataFileSuffix?: string;
  /**
   * Disable passthrough file copy
   */
  passthroughFileCopy?: boolean;
}

/**
 * [Eleventy](https://www.11ty.dev/)
 *
 * A simpler static site generator.
 */
export const defineConfig = (eleventy: ((eleventyConfig: EleventyConfig) => ReturnConfig | undefined)) => eleventy;

/**
 * [Eleventy](https://www.11ty.dev/)
 *
 * A simpler static site generator.
 */
export default defineConfig;
