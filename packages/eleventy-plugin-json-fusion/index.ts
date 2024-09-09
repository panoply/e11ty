import type { EleventyConfig, EleventyScope } from '11ty.ts';
import marked from 'marked';
import matter from 'gray-matter';
import { slug } from 'github-slugger';
import { join, dirname } from 'node:path';
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';

type ContentTypes = 'paragraph' | 'blockquote' | 'codeblock' | 'list';

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
  content?: ContentTypes[]
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
  onOutput(json: Page[]): boolean | any[] | void;
}

interface PageContent {
  /**
   * Heading from a page markdown
   */
  heading: string;
  /**
   * Content within this heading region
   */
  content: Array<{
    /**
     * The contents text
     */
    text: string;
    /**
     * The type of text content
     */
    type: ContentTypes;
  } | {
    /**
     * The contents text
     */
    text: string;
    /**
     * The type of text content
     */
    type: ContentTypes;
    /**
     * The type of text content
     */
    language?: string;
  }>
  /**
   * Page url and anchor reference
   */
  url: string;
}

interface Page {
  /**
   * The page title, extracted from frontmatter
   */
  page: string;
  /**
   * The page description, extracted from frontmatter
   */
  description: string;
  /**
   * The page url, extracted from 11ty context `this.page.url`
   */
  url: string;
  /**
   * The page tags,  extracted from frontmatter
   */
  tags: string[];
  /**
   * The contents of the page
   */
  content: Array<PageContent>;
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

export function fusion (eleventyConfig: EleventyConfig, options?: PluginOptions) {

  const opts: PluginOptions = Object.assign({
    onContent: null,
    onHeading: null,
    onOutput: null,
    minify: false,
    output: '',
    shortCode: 'search',
    codeblock: [],
    ignore: Object.assign({}, options?.ignore),
    content: [
      'blockquote',
      'paragraph',
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

  let pages: Page[] = [];
  let outputPath: string;

  const hasOutputHook = opts.onOutput !== null && typeof opts.onOutput === 'function';
  const allowParagraph = opts.content.includes('paragraph');
  const allowBlockquote = opts.content.includes('blockquote');
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


  eleventyConfig.addShortcode(opts.shortCode, FuseJson);

  eleventyConfig.on('eleventy.after', async () => {

    if (pages.length > 0) {

      if (!outputPath) {
        throw new Error('[plugin-json-fusion] failed to obtain the output path');
      }

      let output: string = JSON.stringify(pages, null, opts.minify ? 0 : 2);

      if (hasOutputHook) {
        const returns = opts.onOutput(pages);
        if (Array.isArray(returns) || typeof returns === 'object') {
          output = JSON.stringify(returns, null, opts.minify ? 0 : 2)
        }
      }

      await write(outputPath, output);

      pages = [];
      outputPath = undefined;

    }
  });

  async function FuseJson (this: EleventyScope, fileName: string) {

    if (!outputPath && this.page.outputPath !== false) {
      const path = dirname(this.page.outputPath)
      const output = path.replace(this.page.url.slice(0, -1), '')
      outputPath = join(process.cwd(), output, opts.output, fileName) + '.json';

    }

    const records: Map<string, Array<{ text: string; type: ContentTypes; language?: string; }>> = new Map();
    const read = await readFile(this.page.inputPath);
    const parse = marked.lexer(read.toString());
    const frontmatter = parse[0].type === 'hr' ? parse.splice(0, 2).map(({ raw }) => raw).join('\n') : null;

    if (frontmatter === null) return;

    const data: {
      title?: string;
      description?: string;
      tags?: string[];
      fuse?: boolean;
    } = matter(frontmatter).data;

    if (data.fuse === false) return;

    let heading: string;

    parse.forEach(token => {

      if (token.type === 'heading') {

        if (ignoreHeading(token.text)) {
          heading = undefined;
          return;
        }

        heading = token.text;

        if (!records.has(token.text)) {

          records.set(token.text, []);

        }

      } else if (records.has(heading)) {

        if (token.type === 'paragraph' && allowParagraph) {

          if (ignoreSyntax(token.text)) return;

          records.get(heading).push({
            text: token.text,
            type: 'paragraph'
          });

        } else if (token.type === 'blockquote' && allowBlockquote) {

          if (ignoreSyntax(token.raw)) return;

          records.get(heading).push({
            text: token.raw.replace(/(^>|\n>)| \:.*(?=[^>])/g, ''),
            type: 'blockquote'
          });

        } else if (token.type === 'code' && opts.codeblock.includes(token.lang)) {

          records.get(heading).push({
            text: token.text,
            type: 'codeblock',
            language: token.lang
          });

        } else if (token.type === 'list' && allowList) {

          if (ignoreSyntax(token.raw)) return;

          records.get(heading).push({
            text: token.raw,
            type: 'list'
          });

        }
      }
    });


    const page: Page = {
      page: data.title,
      description: data.description || '',
      tags: data.tags || [],
      url: this.page.url,
      content: []
    };


    for (const heading of records.keys()) {

      const pathname = page.url.endsWith('/') ? page.url.slice(0, -1) : page.url;
      const cbHeading = typeof opts.onHeading === 'function' ? opts.onHeading(heading) : null

      if (cbHeading === false) continue;

      let content: PageContent = {
        heading: typeof cbHeading === 'string' ? cbHeading : heading,
        content: [],
        url: `${pathname}#${slug(heading)}`,
      }

      records.get(heading).forEach(({ text, type, language = undefined }) => {

        if (typeof text === 'string' && text.length > 0) {

          const cbContent = typeof opts.onContent === 'function'
            ? opts.onContent(text, type, language)
            : null

          if (cbContent === false) return;

          if (language) {

            content.content.push({
              type,
              text: typeof cbContent === 'string' ? cbContent : text
            })

          } else {

            content.content.push({
              type,
              text: typeof cbContent === 'string' ? cbContent : text,
              language
            })

          }
        }
      });


      page.content.push(content);


    }


    if(page.content.length > 0) {

      pages.push(page);

    }

    return '';

  }

}
