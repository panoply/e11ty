import type { EleventyConfig, EleventyScope } from '11ty.ts';
import marked from 'marked';
import matter from 'gray-matter';
import { slug } from 'github-slugger';
import { join, dirname } from 'node:path';
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';

type ContentTypes = 'paragraph' | 'blockquote' | 'codeblock' | 'list';

interface PluginOptions {
  /**
   * The output path the generated JSON file should be written.
   *
   * @default '.'
   */
  output?: string;
  /**
   * Minified
   *
   * @default false
   */
  minify?: boolean
  /**
   * The name of the shortCode
   *
   * @default 'search'
   */
  shortCode?: string;
  /**
   * Ignore Pattern for skipping certain syntax occurances, typically found with template languages.
   * By default, only Liquid delimiter occurrences are ignored
   *
   * @default /^({{|{%|<[a-z]|:::)/
   */
  syntaxIgnores?: RegExp;
  /**
   * An array list of headings to ignore from processing. Use lowercase format, as matches
   * will be converted to lowercase before checking.
   *
   * @default []
   */
  headingIgnores?: Lowercase<string>[];
  /**
   * Content Parse Types
   *
   * @default
   * [
   *   'paragraph',
   *   'blockquote',
   *   'codeblock',
   *   'list'
   * ]
   */
  contentTypes?: ContentTypes[]
  /**
   * Callback method which will be triggered for each page that has been parsed.
   */
  onHeading (heading: string): string | void
  /**
   * Callback method which will be triggered for each page that has been parsed.
   */
  onText(text: string): string | void;
}

interface PageContent {
  /**
   * Heading from a page markdown
   */
  heading: string;
  /**
   * Content within this heading region
   */
  text: string;
  /**
   * Page url and anchor reference
   */
  url: string;
  /**
   * The type of text content
   */
  type: ContentTypes;
  /**
   * The type of text content
   */
  language: string | undefined;
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

export function fuse (eleventyConfig: EleventyConfig, config?: PluginOptions) {

  const options = Object.assign({
    onText: null,
    onHeading: null,
    minify: false,
    contentTypes: [ 'blockquote', 'paragraph', 'list', 'codeblock' ],
    headingIgnores: [],
    output: '',
    shortCode: 'search',
    syntaxIgnores: /^({{|{%|<[a-z]|:::)/g
  }, config)

  let pages: Page[] = [];
  let outputPath: string;

  eleventyConfig.addShortcode(options.shortCode, FuseJson);
  eleventyConfig.on('eleventy.after', async () => {

    if (pages.length > 0) {

      if (!outputPath) {
        throw Error('[plugin-json-fuse] failed to obtain the output path');
      }

      const content = JSON.stringify(pages, null, options.minify ? 0 : 2);

      await write(outputPath, content);

      pages = [];
      outputPath = undefined;

    }
  });

  const allowParagraph = options.contentTypes.includes('paragraph');
  const allowBlockquote = options.contentTypes.includes('blockquote');
  const allowCodeblock = options.contentTypes.includes('blockquote');
  const allowList = options.contentTypes.includes('list');

  async function FuseJson (this: EleventyScope, fileName: string) {

    if (!outputPath && this.page.outputPath !== false) {
      const path = dirname(this.page.outputPath)
      const output = path.replace(this.page.url.slice(0, -1), '')
      outputPath = join(process.cwd(), output, options.output, fileName) + '.json';

    }

    const records: Map<string, Array<{
       text: string;
       type: ContentTypes ;
       language?: string;
    }>> = new Map();

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

        if (options.headingIgnores.includes(token.text)) {
          heading = undefined;
          return;
        }

        heading = token.text;

        if (!records.has(token.text)) {
          records.set(token.text, []);
        }

      } else if (records.has(heading)) {

        if (token.type === 'paragraph' && allowParagraph) {

          if (options.syntaxIgnores.test(token.text)) return;

          records.get(heading).push({
            text: token.text,
            type: 'paragraph'
          });

        } else if (token.type === 'blockquote' && allowBlockquote) {

          records.get(heading).push({
            text: token.raw.replace(/^>|\n>/g, ''),
            type: 'blockquote'
          });

        } else if (token.type === 'code' && allowCodeblock) {

          if (records.has(heading)) {

            records.get(heading).push({
              text: token.text,
              type: 'codeblock',
              language: token.lang
            });

          }

        } else if (token.type === 'list' && allowList) {

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


    for(const heading of records.keys()) {

      const pathname = page.url.endsWith('/') ? page.url.slice(0, -1) : page.url;
      const cbHeading =  typeof options.onHeading === 'function' ? options.onHeading(heading) : null

      if (cbHeading === false) continue;

      let content: PageContent = {
        heading: typeof cbHeading === 'string' ? cbHeading : heading,
        text: '',
        type: 'paragraph',
        url: `${pathname}#${slug(heading)}`,
        language: undefined
      }


      records.get(heading).forEach(({ text, type, language }) => {

        if(typeof text === 'string' && text.length > 0) {

          const cbText = typeof options.onText === 'function' ? options.onText(text, type, language) : null
          if (cbText === false) return;
          content.text += typeof cbText === 'string' ? cbText : heading

        }

      });


      page.content.push(content);


    }


    if(page.content.length > 0) {
      pages.push(page)
    }

    return '';

  }

}
