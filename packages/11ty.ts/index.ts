import type { Join, LiteralUnion } from 'type-fest';
import type { WatchOptions } from 'chokidar';

type TemplateEngines = LiteralUnion<
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
, string>;

type TemplateFormats = LiteralUnion<
  | 'html'
  | 'md'
  | 'liquid'
  | 'haml'
  | 'hbs'
  | 'pug'
  | 'njk'
  | 'json'
  | 'css'
  | 'ejs'
  | 'haml'
  | 'njk'
  | 'hbs'
  | 'mustache'
, string>

type EventNamesDeprecated = LiteralUnion<
  | 'beforeBuild'
  | 'beforeWatch'
  | 'afterBuild'
, string>;

type EventNames = LiteralUnion<
  | 'eleventy.before'
  | 'eleventy.after'
  | 'eleventy.beforeConfig'
  | 'eleventy.beforeWatch'
  | 'eleventy.resourceModified'
  | 'eleventy.resourceAdded'
  | 'eleventy.resourceDeleted'
, string>;

type AsyncFilter = (error: unknown | null, result?: any) => void;

/**
 * Eleventy Plugin
 *
 * Typical argument order structure of an Eleventy plugin
 */
type EleventyPlugin = (eleventy: EleventyConfig, options?: any) => any;

/**
 * Eleventy Plugin Options
 *
 * Plugin options are obtained by cherry-picking the parameter
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

export interface EleventySuppliedData {
  /**
   * URL can be used in `<a href>` to link to other templates.
   *
   * > **NOTE:**
   * >
   * > This value will be `false` if `permalink` is set to `false`.
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#url)
   *
   * @example
   * "/current/page/myFile/"
   */
  url: string | false;
  /**
   * For permalinks: inputPath filename minus template file extension.
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#fileslug)
   *
   * @example
   * "myFile"
   */
  fileSlug: string;
  /**
   * For permalinks: inputPath minus template file extension.
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#filepathstem)
   *
   * @example
   * "/current/page/myFile"
   */
  filePathStem: string;
  /**
   * JavaScript `Date` object for current page. Used for sorting and typically derived from front matter or
   * file stats (used to sort collections).
   *
   * [11ty Docs](https://www.11ty.dev/docs/dates/)
   */
  date: Date;
  /**
   * The path to the original source file for the template.
   *
   * > **NOTE:**
   * >
   * > this includes your input directory path!
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#inputpath)
   *
   * @example
   * "./current/page/myFile.md"
   */
  inputPath: string;
  /**
   * Depends on your output directory (the default is `_site`).
   * You should probably use `url` instead.
   *
   * > **NOTE:**
   * >
   * > This value will be `false` if `permalink` is set to `false`.
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#outputpath)
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
   * [11ty Docs](https://www.11ty.dev/docs/languages/liquid/#templatecontent)
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
  lang?: string;
  /**
   * The raw unparsed/unrendered plaintext content for the current template
   */
  rawInput: string;
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
     * "/Users/zachleat/myProject"
     */
    root: string;
    /**
     * Absolute path to the current config file
     *
     * @example
     * "/Users/zachleat/myProject/.eleventy.js"
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

interface URLPattern {
  test(input?: URLPatternInit | string, baseURL?: string): boolean;
  exec(input?: URLPatternInit | string, baseURL?: string): {
    inputs: [ URLPatternInit | string];
    protocol: URLPatternComponentResult;
    username: URLPatternComponentResult;
    password: URLPatternComponentResult;
    hostname: URLPatternComponentResult;
    port: URLPatternComponentResult;
    pathname: URLPatternComponentResult;
    search: URLPatternComponentResult;
    hash: URLPatternComponentResult;
  } | null;
  readonly protocol: string;
  readonly username: string;
  readonly password: string;
  readonly hostname: string;
  readonly port: string;
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
}

interface URLPatternInit {
  baseURL?: string;
  username?: string;
  password?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

interface URLPatternComponentResult {
  input: string;
  groups: {
    [key: string]: string | undefined;
  };
}

export type OnRequestCallbackParams = {
  /**
   * Returns the URL structured representation, access to the protocol, host,
   * pathname, query string, and fragment.
   */
  url: URL;
  /**
   * Returns the URLPattern structured representation.
   */
  pattern: URLPattern,
  /**
   * Pattern Groups will include URLPattern matches e.g. `/foo/zach => { name: "zach" }`
   */
  patternGroups: Record<string, {
    [key: string]: string
  }>
}

export interface EleventyScope {
  /**
   * Information about the current page (see the code block below for page contents).
   * For example, page.url is useful for finding the current page in a collection.
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#page-variable)
   */
  page: EleventySuppliedData;
  /**
   * Contains Eleventy-specific data from environment variables and the Serverless plugin (if used).
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#eleventy-variable)
   */
  eleventy: EleventyData;
}

export interface EleventyServer {
  /**
   * Whether the live reload snippet is used.
   *
   * @default
   * true
   */
  liveReload?: boolean;
  /**
   * Whether DOM diffing updates are applied where possible instead of page reloads.
   *
   * @default
   * true
   */
  domDiff?: boolean;
  /**
   * The starting port number. Will increment up to (configurable) 10 times if a port is already in use.
   *
   * @default 8080
   */
  port?: number;
  /**
   * Additional files to watch that will trigger server updates.
   * Accepts an Array of file paths or globs (passed to `chokidar.watch`).
   * Works great with a separate bundler writing files to your output folder.
   *
   * @example
   * ["_site/style/*.css"]
   *
   * @default
   * []
   */
  watch?: string[];
  /**
   * Show local network IP addresses for device testing.
   *
   * @default
   * false
   */
  showAllHosts?: boolean;
  /**
   * Use a local key/certificate to opt-in to local HTTP/2 with https.
   */
  https?: {
    /**
     * @example
     * "./localhost.key"
     */
    key?: string;
    /**
     * @example
     * "./localhost.cert"
     */
    cert?: string;
  };
  /**
   * Change the default file encoding for reading/serving files.
   *
   * @default
   * 'utf-8'
   */
  encoding?: string;
  /**
   * Show the dev server version number on the command line.
   *
   * @default
   * false
   */
  showVersion?: boolean;
  /**
   * Change the name of the folder name used for injected scripts.
   *
   * @default
   * ".11ty"
   */
  injectedScriptsFolder?: string;
  /**
   * Number of times to increment a port if already in use.
   *
   * @default
   * 10
   */
  portReassignmentRetryCount?: number;
  /**
   * Aliasing feature - Allowed list of files that can be served from outside `dir`.
   *
   * > **NOTE**
   * >
   * > Merged with pass through aliases and undocumented.
   */
  aliases?: Record<string, any>;
  /**
   * Alias for backwards compatibility, renamed to `injectedScriptsFolder` in Dev Server 1.0+.
   *
   * @default
   * ".11ty"
   */
  folder?: string;
  /**
   * Alias for backwards compatibility, renamed to `liveReload` in Dev Server 1.0+.
   *
   * @default
   * true
   */
  enabled?: boolean;
  /**
   * Alias for backwards compatibility, renamed to `domDiff` in Dev Server 1.0+.
   *
   * @default
   * true
   */
  domdiff?: boolean;
  /**
   * Set default response headers
   *
   * @default
   * {}
   */
  headers?: Record<string, string>;
  /**
   * May be overridden by Eleventy, adds a virtual base directory to your project
   *
   * @default
   * '/'
   */
  pathPrefix?: string;
  /**
   * Use a cache for file contents
   *
   * @default
   * false
   */
  useCache?: boolean
  /**
   * An object mapping a URLPattern pathname to a callback function for on-request processing
   *
   * [11ty Docs](https://www.11ty.dev/docs/dev-server/#on-request-for-request-time-processing)
   */
  onRequest?: Record<string, (params?: OnRequestCallbackParams) => void | undefined | string | Response>;
}


export interface EleventyBrowserSync extends EleventyServer {
  /**
   * You can swap back to Eleventy Dev Server using the `setServerOptions` configuration API
   * and the [@11ty/eleventy-server-browsersync](https://github.com/11ty/eleventy-server-browsersync) package.
   */
  module: '@11ty/eleventy-server-browsersync';
  /**
   * Opt-out of the Browsersync snippet
   *
   * @default
   * false
   */
  snippet?: boolean;
  /**
   * Decide which URL to open automatically when Browsersync starts.
   *
   * @default
   * false
   */
  open?: LiteralUnion<"ui" | "local" | "external" | "ui-external" | "tunnel", string> | boolean | undefined;
  /**
   * The small pop-over notifications in the browser are not always needed/wanted.
   *
   * @default
   * false
   */
  notify?: boolean;
  /**
   * Browsersync includes a user-interface that is accessed via a separate port.
   *
   * The UI allows to controls all devices, push sync updates and much more.
   *
   * @default
   * false
   */
  ui?: false,
  /**
   * Clicks, Scrolls & Form inputs on any device will be mirrored to all others.
   *
   * @default
   * false
   */
  ghostMode?: boolean | {
      clicks?: boolean | undefined;
      scroll?: boolean | undefined;
      forms?: {
        inputs?: boolean;
        submit?: boolean;
        toggles?: boolean;
    } | boolean | undefined;
  }
}

interface EleventDataExtension {
  /**
   * The callback function used to parse the data.
   *
   * @param {string} contents - The data file's contents (unless read: false).
   * @param {string} filePath - The file path.
   * @returns {Record<string, any>} Parsed data.
   */
  parser: (contents: string, filePath: string) => Record<string, any> | Promise<Record<string, any>>;
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
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
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
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
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
   * Liquid Shortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addLiquidShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Nunjucks Shortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addNunjucksShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Handlebars Shortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addHandlebarsShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string): void;
  /**
   * JavaScript Function Shortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#shortcodes)
   */
  addJavaScriptFunction(
    shortcodeName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Liquid Paired Shortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes)
   */
  addPairedLiquidShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, content: string, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Nunjucks Paired Shortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes)
   */
  addPairedNunjucksShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, content: string, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * Handlebars Paired Shortcode
   *
   * [11ty Docs](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes)
   */
  addPairedHandlebarsShortcode(
    shortcodeName: string,
    filter: (this: EleventyScope, content: string, ...args: any[]) => string): void;
}



interface CollectionsAPI {
  /**
   * Returns an array or unsorted items (in whatever order they were added).
   *
   * [11ty Docs](https://www.11ty.dev/docs/collections-api/#get-all)
   */
  getAll(): EleventySuppliedData[];
  /**
   * Returns an array using the default sorting algorithm (ascending by date, filename tiebreaker).
   *
   * [11ty Docs](https://www.11ty.dev/docs/collections-api/#get-all-sorted)
   */
  getAllSorted(): EleventySuppliedData[];
  /**
   * Returns an array of content that matches a tag.
   *
   * [11ty Docs](https://www.11ty.dev/docs/collections-api/#get-filtered-by-tag-tag-name)
   */
  getFilteredByTag(tagName: string): EleventySuppliedData[];
  /**
   * Retrieve content that includes all of the tags passed.
   *
   * [11ty Docs](https://www.11ty.dev/docs/collections-api/#get-filtered-by-tags-tag-name-second-tag-name)
   */
  getFilteredByTags(...tagNames: string[]): EleventySuppliedData[];
  /**
   * Returns an array. Will match an arbitrary glob (or an array of globs)
   * against the input file's full inputPath (including the input directory)
   *
   * [11ty Docs](https://www.11ty.dev/docs/collections-api/#get-filtered-by-glob-glob)
   *
   * @example
   * collectionApi.getFilteredByGlob("dir/*.md");
   * collectionApi.getFilteredByGlob("_posts/*.md");
   *
   * // Also accepts an array of globs!
   * collectionApi.getFilteredByGlob(["posts/*.md", "notes/*.md"])
   */
  getFilteredByGlob(glob: string | string[]): EleventySuppliedData[];
}


/**
 * [Eleventy](https://www.11ty.dev/)
 *
 * A simpler static site generator.
 */
export interface EleventyConfig extends Filters, ShortCodes, PluginExtend {
  [method: string]: any;

  /**
   * Customize the watchIgnores `Set`
   *
   * [11ty Docs](https://www.11ty.dev/docs/watch-serve/#configuration-api)
   */
  watchIgnores: Set<string>
  /**
   * In order to maximize user-friendliness to beginners,
   * Eleventy will show each file it processes and the output file.
   * To disable this noisy console output, use quiet mode!
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#enable-quiet-mode-to-reduce-console-noise)
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
  namespace(prefix: string, callback: () => any): void;
  /**
   * Eleventy Dev Server
   *
   * You can configure the server with the configuration API method.
   *
   * [11ty Docs](https://www.11ty.dev/docs/dev-server)
   */
  setServerOptions<T extends EleventyServer>(options: T): void;
  setServerOptions<T extends EleventyBrowserSync>(options: T): void;
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
   */
  setTemplateFormats(formats: readonly TemplateEngines[] | Join<TemplateEngines[], ','>): void;
  /**
   * Add to existing types of templates that should be transformed.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#configuration-api)
   */
  addTemplateFormats(formats: readonly TemplateEngines[] | Join<TemplateEngines[], ','>): void;
  /**
   * Virtual Templates
   *
   * In addition to template files in your input directory, Eleventy can also process virtual
   * templates defined in your configuration file (or plugins).
   *
   * [11ty Docs](https://www.11ty.dev/docs/virtual-templates/)
   */
  addTemplate(virtualPath: string, content: string, data: { [key: string]: any }): void;
  addTemplate(virtualPath: string, callback: (data: any) => any): void;
  /**
   * Use a full deep merge when combining the Data Cascade.
   * This will use something similar to lodash.mergewith to
   * combine Arrays and deep merge Objects, rather than a simple
   * top-level merge using `Object.assign`
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-deep-merge/)
   *
   * _As of Eleventy **1.0** this defaults to enabled (but API still exists for opt-out)._
   */
  setDataDeepMerge(deepMerge: boolean): void;
  /**
   * Customize front matter parsing
   */
  setFrontMatterParsingOptions(options: any): void;
  /**
   * The Preprocessor Configuration API allows you to intercept and modify the content in
   * template files (not Layouts) before they’re processed and rendered by Eleventy.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config-preprocessors/)
   *
   * @param name
   * An arbitrary name (String) used for error messaging.
   *
   * @param exts
   * a list of comma separated file extensions
   *
   * @param callback
   * The callback function.
   */
  addPreprocessor(name: string, exts: string | string[], callback: (
    this: EleventyScope,
    data: any,
    content: string
  ) => false | string | undefined): void
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
   * [11ty Docs](https://www.11ty.dev/docs/data-custom/)
   */
  addDataExtension(
    fileExtension: string | string[],
    callback: (this: EleventyScope, contents: any, filePath?: string) => EleventDataExtension): void;

  /**
   * Configuration API for Custom Date Parsing
   *
   * Method for adding your own custom date parsing logic. This is a preprocessing step for existing Date logic.
   * Any number of callbacks can be assigned using `eleventyConfig.addDateParsing` and they will run serially.
   *
   * [11ty Docs](https://www.11ty.dev/docs/dates/#configuration-api-for-custom-date-parsing)
   */
  addDateParsing(callback: (this: EleventyScope, date: Date) => any): void
  /**
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
   */
  setDataFileSuffixes(files: string[]): void;
  /**
   * > **DEPRECATED**
   * >
   * > _This only applies to Eleventy **1.x** and **0.x** and will be removed when
   * Eleventy **2.0** is stable. If you want to use Browsersync with Eleventy **2.0**,
   * learn how to [swap back to BrowserSync](https://www.11ty.dev/docs/watch-serve/#swap-back-to-browsersync)_
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
   * when files have changed during --watch or --serve modes. You probably won’t
   * need this, but is useful in some edge cases with other task runners (Gulp, Grunt, etc).
   *
   * [11ty Docs](https://www.11ty.dev/docs/watch-serve/#add-delay-before-re-running)
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
   * Expands collections with your own custom filtering. The data collection gets passed to the callback.
   * You can use it in all sorts of ways!
   *
   * Callbacks can return any arbitrary object type and it’ll be available as data in the template,
   * Arrays, strings, objects—have fun with it.
   *
   * [11ty Docs](https://www.11ty.dev/docs/collections-api)
   */
  addCollection(
    name: string,
    callback: (this: EleventyScope, collectionApi: CollectionsAPI) => any | PromiseLike<any>
  ): void
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
   * Emulate Passthrough Copy During `--serve`
   *
   * Practically speaking, this means that (during `--serve` only!) files are referenced directly
   * and will not be copied to your output folder. Changes to passthrough file copies will not
   * trigger an Eleventy build but will live reload appropriately in the dev server.
   *
   * [11ty Docs](https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve)
   */
  setServerPassthroughCopyBehavior(key: LiteralUnion<"passthrough", string>): void
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
   */
  addPassthroughCopy(path: string | { [input: string]: string }): void;
  /**
   * Universal filters can be added in a single place and are available to
   * multiple template engines, simultaneously. This is currently supported
   * in JavaScript, Nunjucks, Liquid, and Handlebars.
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/#filters)
   */
  addFilter(
    filterName: string,
    filter: (this: EleventyScope, ...args: any[]) => string | PromiseLike<string>): void;
  /**
   * If you’d like to reuse existing filters in a different way, consider
   * using the new Configuration API getFilter method. You can use this
   * to alias a filter to a different name. You can use this to use a filter
   * inside of your own filter. You can use this to use a filter inside of a shortcode.
   *
   * [11ty Docs](https://www.11ty.dev/docs/filters/#access-existing-filters)
   */
  getFilter(filterName: string): (...args: any[]) => string | PromiseLike<string>;
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
  on(event: EventNames, handler: (eventData?: any) => void | Promise<void>): void;
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
  /**
   * Enable incremental builds to only rebuild changed files.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#incremental-builds)
   */
  setIncrementalBuilds(enabled: boolean): void;
  /**
   * Enable passthrough copy behavior during serve mode.
   *
   * [11ty Docs](https://www.11ty.dev/docs/copy/#passthrough-copy-in-serve-mode)
   */
  setServerPassthroughCopy(enabled: boolean): void;
  /**
   * Enable or disable dynamic permalinks.
   *
   * [11ty Docs](https://www.11ty.dev/docs/permalinks/#dynamic-permalinks)
   */
  setDynamicPermalinks(enabled: boolean): void;
  /**
   * Enable dry run mode to process without writing files.
   */
  setDryRun(enabled: boolean): void;
  /**
   * Controls the top level directory/file/glob that we’ll use to look for templates.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#input-directory)
   *
   * @param dir
   * 	Any valid directory, defaults to `.`
   */
  setInputDirectory(dir?: string): void
  /**
   * Set the directory for includes.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#directory-for-includes)
   *
   * @param dir
   * Any valid directory inside of `dir.input` (an empty string `""` is supported)
   */
  setIncludesDirectory(dir?: string): void;
  /**
   * This configuration option is optional but useful if you want your Eleventy layouts to
   * live outside of the Includes directory. Just like the Includes directory, these files
   * will not be processed as full template files, but can be consumed by other templates.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#directory-for-layouts-optional)
   *
   * @param dir
   * Any valid directory inside of dir.input (an empty string "" is supported)
   */
  setLayoutsDirectory(dir?: string): void;
  /**
   * Controls the directory inside which the finished templates will be written to.
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#output-directory)
   *
   * @param dir
   * Any string that will work as a directory name. Eleventy creates this if it doesn’t exist.
   */
  setOutputDirectory(dir?: string): void;
  /**
   * Controls the directory inside which the global data template files, available to all templates,
   * can be found. Read more about [Global Data Files](https://www.11ty.dev/docs/data-global/).
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#directory-for-global-data-files)
   *
   * @param dir
   * Any valid directory inside of dir.input
   */
  setDataDirectory(dir?: string): void;
  /**
   * Add layout aliases. Say you have a bunch of existing content using `layout: post`.
   * If you don’t want to rewrite all of those values, map post to a new file using this method.
   *
   * [11ty Docs](https://www.11ty.dev/docs/layouts/#layout-aliasing)
   *
   */
  addLayoutAlias(from: string, to: string): void;
  /**
   * Omits the layout file extension. Disables extensionless layouts in your project.
   *
   * [11ty Docs](https://www.11ty.dev/docs/layouts/#omitting-the-layouts-file-extension)
   */
  setLayoutResolution(option: boolean): void;
  /**
   * Permalinks without File Extensions
   *
   * Eleventy will throw an error if you attempt to write to a file without a file extension.
   * Disable the error messaging using this method.
   *
   * [11ty Docs](https://www.11ty.dev/docs/permalinks/#permalinks-without-file-extensions)
   */
  configureErrorReporting(options: { allowMissingExtensions: boolean }): void
  /**
   * Starting in Eleventy 3.0, the `pkg`, `eleventy`, `page`, `content`, and `collections` properties are now frozen
   * from external modification to prevent accidental overrides interfering with Eleventy internals.
   *
   * You can temporarily opt-out of the behavior using this method.
   *
   * [11ty Docs](https://www.11ty.dev/docs/data-eleventy-supplied/#frozen-data)
   */
  setFreezeReservedData(option: boolean): void
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
  templateFormats?: TemplateFormats | TemplateFormats[];
  /**
   * URL path prefix
   */
  pathPrefix?: string;
  /**
   * **⚠️ WARNING**
   *
   * **The `htmlOutputSuffix` feature was removed in Eleventy 3.0.**
   * **[GitHub #3327](https://github.com/11ty/eleventy/issues/3327)**
   *
   * ---
   *
   * Suffix that will be added to output files if `dir.input` and `dir.output` match.
   *
   * If an HTML template has matching input and output directories, `index.html` files will
   * have this suffix added to their output filename to prevent overwriting the template.
   * Read more at the [HTML template docs](https://www.11ty.dev/docs/languages/html/).
   *
   * [11ty Docs](https://www.11ty.dev/docs/config/#change-exception-case-suffix-for-html-files)
   *
   * @deprecated
   */
  htmlOutputSuffix?: string;
  /**
   * Set file suffix for template and directory specific data files.
   *
   * > Prior to `v2.0.0` backwards compatibility for old projects by using this property as a fallback.
   * > Use `eleventyConfig.setDataFileSuffixes()` instead
   *
   * @deprecated
   */
  jsDataFileSuffix?: string;
  /**
   * Disable passthrough file copy
   */
  passthroughFileCopy?: boolean;
  /**
   * Enable incremental builds
   */
  incremental?: boolean;
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