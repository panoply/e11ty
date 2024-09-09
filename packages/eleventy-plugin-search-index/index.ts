import type { EleventyConfig, EleventyScope } from '11ty.ts';
import marked from 'marked';
import matter from 'gray-matter';
import nomark from 'nomark'
import { slug } from 'github-slugger';
import { join, dirname } from 'node:path';
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';

type ContentTypes = 'text' | 'quote' | 'code' | 'list';

interface PluginOptions {
  /**
   * Output path that the generated JSON file should be written. By default,
   * the file will be written the the root directory of your defined `output`.
   *
   * @default '.'
   */
  output?: string;
  /**
   * Whether or not the JSON file should output minified.
   *
   * @default false
   */
  minify?: boolean
  /**
   * The name of the shortCode to use.
   *
   * @default 'search'
   */
  shortCode?: string;
  /**
   * A list of language identifier code blocks that should be
   * included in generated output.
   *
   * @default ['bash']
   */
  codeblock?: string[];
  /**
   * Indicates whether to strip HTML tags from the text
   *
   * @default true
   */
  stripHtml?: boolean;
  /**
   * Indicates whether to strip HTML tags from the text
   *
   * @default true
   */
  stripMarkdown?: boolean;
  /**
   * Pattern matches to ignore from processing
   */
  ignore?: {
    /**
     * Ignore Pattern for skipping certain syntax occurances, typically found with template languages.
     * By default, only Liquid delimiter occurrences are ignored
     *
     * @default /^({{|{%|<[a-z]|:::|> \:[a-z])/
     */
    syntax?: (RegExp | string)[];
    /**
     * An array list of heading occurances to ignore from processing. Can either be regular expression
     * or a lowercase string to match against.
     *
     * @default []
     */
    heading?: (RegExp | Lowercase<string>)[];
  };
  /**
   * Content Parse Types
   *
   * @default
   * [
   *   'paragraph',
   *   'blockquote',
   *   'list'
   * ]
   */
  content?: ContentTypes[];
  /**
   * Content is grouped according to heading occurences. For every heading, a new region
   * is generated and concatenated into the page `content` array.
   *
   * > **Return `false`**
   * >
   * > Return a value of `false` to skip processing a certain heading region.
   *
   * > **Return `string`**
   * >
   * > Return a `string` value to replace the heading.
   */
  onHeading (heading: string): boolean | string | void
  /**
   * Callback method which will be triggered for each page that has been parsed.
   *
   * > **Return `false`**
   * >
   * > Return a value of `false` to skip processing a certain heading region.
   *
   * > **Return `string`**
   * >
   * > Return a `string` value to replace the heading.
   */
  onContent(text: string, type?: ContentTypes, language?: string): boolean | string | void;
  /**
   * Callback method which will be triggered for each page that has been parsed.
   *
   * > **Return `false`**
   * >
   * > Return a value of `false` to skip processing a certain heading region.
   *
   * > **Return `string`**
   * >
   * > Return a `string` value to replace the heading.
   */
  onOutput(json: SearchIndex): any;
}


export interface SearchPage {
  /**
   * The page title, extracted from frontmatter
   */
  title: string;
  /**
   * The page description, extracted from frontmatter
   *
   * @default ''
   */
  description: string;
  /**
   * The page url
   */
  url: string;
  /**
   * The page tags
   *
   * @default []
   */
  tags: string[];
  /**
   * The page index
   */
  pidx: number;
  /**
   * The heading indexes associated with this page
   */
  hidx:[ start: number, end?: number ]
  /**
   * The content indexes associated with this page
   */
  cidx: [ start: number, end?: number ]
}

export interface SearchHeading {
  /**
   * Page url and anchor reference `/path#anchor`
   */
  anchor: string;
  /**
   * The page index
   */
  pidx: number;
  /**
   * The heading index
   */
  hidx: number;
  /**
   * The content indexes this heading contains
   */
  cidx: [ start: number, end?: number ]
}

export interface SearchContent {
  /**
   * The text to search
   */
  text: string;
  /**
   * The text content type
   */
  type: 'heading' | 'text' | 'quote' | 'code' | 'list';
  /**
   * When type is `codeblock` this will hold language name value
   */
  lang?: string;
  /**
   * The sort index of the text type.
   *
   * - `1` heading
   * - `2` text
   * - `3` list
   * - `4` code
   * - `5` quote
   *
   * > Use `1` for heading matches.
   */
  sort: number;
  /**
   * The `pages[]` index location this content belongs
   */
  pidx: number;
  /**
   *The `heading[]` index location this content belongs
   */
  hidx: number;
  /**
   * This content index.
   */
  cidx: number;
};



export interface SearchIndex {
  /**
   * Pages
   */
  pages: SearchPage[];
  /**
   * Indexes
   */
  heading: SearchHeading[];
  /**
   * Indexes
   */
  content: SearchContent[];
}


async function exists (path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

async function write (filePath: string, data: string) {

  try {

    const dir = dirname(filePath);
    const exist = await exists(dir);

    if (!exist) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(filePath, data);

  } catch (err) {
    throw new Error(err);
  }
}

export function search (eleventyConfig: EleventyConfig, options?: PluginOptions) {

  const opts: PluginOptions = Object.assign({
    onContent: null,
    onHeading: null,
    onOutput: null,
    minify: false,
    output: '',
    shortCode: 'search',
    codeblock: [],
    stripMarkdown: true,
    stripHtml: true,
    ignore: Object.assign({}, options?.ignore),
    content: [
      'text',
      'quote',
      'code',
      'list'
    ],
    codeblocks: [
      'bash'
    ],
  }, options)

  if(!('heading' in opts.ignore)) opts.ignore.heading = [];
  if(!('syntax' in opts.ignore)) {

    opts.ignore.syntax = [
      /^<[a-z]/g,
      '{{',
      '{%',
      ':::'
    ]

  }

  const model: SearchIndex = { pages: [], heading: [], content: [] };

  let outputPath: string;

  const hasOutputHook = opts.onOutput !== null && typeof opts.onOutput === 'function';
  const allowText = opts.content.includes('text');
  const allowQuote = opts.content.includes('quote');
  const allowList = opts.content.includes('list');

  const ignoreHeading = (heading: string) => opts.ignore.heading.some(match => {
    return typeof match === 'string'
      ? match === heading.toLowerCase()
      : match.test(heading)
  })

  const ignoreSyntax = (content: string) => opts.ignore.syntax.some(match => {
    return typeof match === 'string'
      ? content.startsWith(match)
      : match.test(content)
  })


  eleventyConfig.addShortcode(opts.shortCode, SearchIndexPlugin);

  eleventyConfig.on('eleventy.after', async () => {

    if (model.pages.length > 0 && model.heading.length > 0 && model.content.length > 0) {

      if (!outputPath) {
        throw new Error('[plugin-json-fusion] failed to obtain the output path');
      }

      let output: string = JSON.stringify(model, null, opts.minify ? 0 : 2);

      if (hasOutputHook) {
        const returns = opts.onOutput(model);
        if (Array.isArray(returns) || typeof returns === 'object') {
          output = JSON.stringify(returns, null, opts.minify ? 0 : 2)
        }
      }

      await write(outputPath, output);

      model.pages = [];
      model.heading = [];
      model.content = [];
      outputPath = undefined;

    }
  });

  async function SearchIndexPlugin (this: EleventyScope, fileName: string) {

    if (!outputPath && this.page.outputPath !== false) {
      const path = dirname(this.page.outputPath)
      const output = path.replace(this.page.url.slice(0, -1), '')
      outputPath = join(process.cwd(), output, opts.output, fileName) + '.json';

    }

    const records: Map<string, Array<{ text: string; type: ContentTypes; lang?: string; sort: number  }>> = new Map();
    const read = await readFile(this.page.inputPath);
    const parse = marked.lexer(read.toString());
    const frontmatter = parse[0].type === 'hr' ? parse.splice(0, 2).map(({ raw }) => raw).join('\n') : null;

    if (frontmatter === null) return;

    const data: {
      title?: string;
      description?: string;
      tags?: string[];
      search?: boolean;
    } = matter(frontmatter).data;

    if (data.search === false) return;

    let heading: string;

    parse.forEach(token => {

      if (token.type === 'heading') {

        heading = nomark(token.text, {
          stripHtml: opts.stripHtml,
          stripMarkdown: opts.stripMarkdown
        });

        if (ignoreHeading(heading)) {
          heading = undefined;
          return;
        }

        if (!records.has(heading)) {

          records.set(heading, []);

        }

      } else if (records.has(heading)) {

        if (token.type === 'paragraph' && allowText) {

          const text = nomark(token.text, {
            stripHtml: opts.stripHtml,
            stripMarkdown: opts.stripMarkdown
          });

          if (ignoreSyntax(text)) return;

          records.get(heading).push({
            text,
            type: 'text',
            sort: 2
          });

        } else if (token.type === 'blockquote' && allowQuote) {

          const text = nomark(token.raw, {
            stripHtml: opts.stripHtml,
            stripMarkdown: opts.stripMarkdown
          });

          if (ignoreSyntax(text)) return;

          records.get(heading).push({
            text,
            type: 'quote',
            sort: 5
          });

        } else if (token.type === 'code' && opts.codeblock.includes(token.lang)) {

          records.get(heading).push({
            text: token.text,
            type: 'code',
            lang: token.lang,
            sort: 4
          });

        } else if (token.type === 'list' && allowList) {

          const text = nomark(token.raw, {
            stripHtml: opts.stripHtml,
            stripMarkdown: opts.stripMarkdown
          });

          if (ignoreSyntax(text)) return;

          records.get(heading).push({
            text,
            type: 'list',
            sort: 3
          });

        }
      }
    });

    const { url } = this.page
    const pidx = model.pages.length
    model.pages.push({
      title: data.title,
      description: data.description || '',
      tags: data.tags || [],
      url,
      pidx,
      hidx: [model.heading.length],
      cidx: [model.content.length]
    })

    for (const heading of records.keys()) {

      const pathname = url.endsWith('/') ? url.slice(0, -1) : url;
      const cbHeading = typeof opts.onHeading === 'function' ? opts.onHeading(heading) : null

      if (cbHeading === false) continue;

      const headingName = typeof cbHeading === 'string' ? cbHeading : heading;
      const hidx = model.heading.length;
      const cidx = model.content.length;

      model.heading.push({
        anchor: `${pathname}#${slug(heading)}`,
        hidx,
        pidx,
        cidx: [cidx]
      })

      model.content.push({
        text: headingName,
        type: 'heading',
        sort: 1,
        hidx,
        pidx,
        cidx,
      })

      records.get(heading).forEach(({ text, type, sort, lang = undefined }) => {

        if (typeof text === 'string' && text.length > 0) {

          const cbContent = typeof opts.onContent === 'function'
            ? opts.onContent(text, type, lang)
            : null

          if (cbContent === false) return;

          const content: SearchContent = {
            text: typeof cbContent === 'string' ? cbContent : text,
            type,
            sort,
            hidx,
            pidx,
            cidx: model.content.length,
          }

          if (lang) content.lang = lang

          model.content.push(content);


        }

      });

      if (model.content.length > cidx) {

        const endcidx = model.content.length - 1

        model.pages[pidx].cidx.push(endcidx);
        model.heading[hidx].cidx.push(endcidx);

      }

    }

    model.pages[pidx].hidx.push(model.heading.length - 1)

    return '';

  }

}
