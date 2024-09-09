/* eslint-disable no-unused-vars */
import type { LiteralUnion } from 'type-fest';
import type { EleventyConfig } from '11ty.ts';
import type { Options, Token } from 'markdown-it';
import md from 'markdown-it';
import mdcontainer from 'markdown-it-container';
import mdanchor from 'markdown-it-anchor'
import mdattrs from 'markdown-it-attrs'
import { slug } from 'github-slugger'

export type Languages = LiteralUnion<(
  | 'html'
  | 'bash'
  | 'css'
  | 'scss'
  | 'liquid'
  | 'xml'
  | 'json'
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'yaml'
  | 'plaintext'
  | 'treeview'
), string>

export interface CodeBlocks {
  /**
   * The Code Block Language ID
   */
  language: Languages;
  /**
   * The inner contents of the code block
   */
  raw: string;
  /**
   * The inner contents of the code block
   */
  escape(): string;
}

export interface CodeInline {
  /**
   * The Code Block Language ID, e.g: ``{js} foo.method()`` > `javascript`
   */
  language: Languages;
  /**
   * The inner contents of the inline region
   */
  raw: string;
}

export interface IPapyrus {

  /**
   * Inline `<code>` Highlighting. Enables markdown inline code highlighting.
   * Express inline markdown as:
   *
   * ```
   * `{js} foo.method()` will highlight to JavaScript
   * ```
   */
  inline?: boolean;
  /**
   * Whether to use `papyrus.static()` OR `papyrus.highlight()`.
   *
   * - Using `static` will render editor mode
   * - Using `highlight` will render readonly code block only
   *
   * @default 'highlight'
   */
  render?: 'static' | 'highlight';
}


export interface IMarkdown {
  /**
   * Exposes `syntax()` method.
   */
  highlight?: {
    /**
     * Callback function for applying Syntax Highlighting within a
     * codeblock of markdown.
     */
    block(options: CodeBlocks): string;
    /**
     * Inline `<code>` Highlighting. Enables markdown inline code highlighting.
     * Express inline markdown as:
     *
     * ```
     * `{js} foo.method()` will highlight to JavaScript
     * ```
     */
    inline(options: CodeInline): string;
  };
  /**
   * Anchors
   */
  anchors?: boolean | {
    /**
     * Add Attributes to output anchor elements
     */
    attrs?: Array<[ name: string, value: string ]>;
    /**
     * Plugin Options
     *
     * The `callback` and `slugify` options are omitted.
     */
    plugin?: Omit<mdanchor.AnchorOptions, 'slugify' | 'callback'>
  };
  /**
   * Markdown IT Config
   */
  options?: Omit<Options, 'highlight'>;
}


const SEP = `\n\n${'-'.repeat(50)}\n\n`;


/**
 * Prints an error to the console when an issue occurs during the
 * `highlightCode` function.
 */
function highlightError (language: Languages, error: string) {

  console.error(
    SEP,
    ' HIGHLIGHT ERROR\n',
    ' LANGUAGE: ' + language + '\n\n',
    error,
    SEP
  );

}

function highlightCode (md: md, raw: string, language: string) {

  if (language) {
    try {
      return <CodeBlocks>{
        language,
        raw,
        escape: () => md.utils.escapeHtml(raw)
      };
    } catch (err) {
      highlightError(language, err);
      return md.utils.escapeHtml(raw);
    }
  }

  return md.utils.escapeHtml(raw);

};


const grid = (md: md) => function (tokens: md.Token[], idx: number) {

  if (tokens[idx].nesting === 1) {
    const col = tokens[idx].info.trim().match(/^grid\s+(.*)$/);
    if (col !== null) return /* html */`<div class="${md.utils.escapeHtml(col[1])}">`;
  }

  return '</div>';

};


/**
 * Renders inline code blocks
 */
const codeinline = (callback: (params: {
  raw: string;
  language: Languages
}) => string) => function (md: md) {


  function render (token: string) {

    const pull = token.indexOf('} ')
    const raw = token.slice(pull + 1).trimStart()
    const language = token.slice(1, pull)

    return callback({ raw, language})

  }

  function scan (state: md.StateBlock) {

    for (let x = state.tokens.length - 1; x >= 0; x--) {

      if (state.tokens[x].type !== 'inline') continue

      const token = state.tokens[x].children

      for (let i = token.length - 1; i >= 0; i--) {
        if (token[i].type !== 'code_inline') continue;
        if(!/^{\w+} /.test(token[i].content)) continue
        token[i].tag = ''
        token[i].type = 'html_block',
        token[i].markup = ''
        token[i].block = true,
        token[i].content = render(token[i].content);
      }
    }
  }


  // @ts-ignore
  md.core.ruler.push('inline_papyrus', scan)

}



function notes (tokens: md.Token[], index: number) {

  return tokens[index].nesting === 1 ? '<blockquote class="note">' : '</blockquote>';

}

export function markdown (eleventy: EleventyConfig, options: IMarkdown = { options: {} }) {

  const opts = Object.assign({ html: true, linkify: true, typographer: true, breaks: false }, options.options);
  const blockFn = options?.highlight?.block;
  const inlineFn = options?.highlight?.inline;
  const markdown = md('default', {
    ...opts,
    highlight: (string, language) => {
      const syntax = highlightCode(markdown, string, language);
      if (blockFn && typeof syntax === 'object') return blockFn(syntax);
      return string;
    }
  });

  if(inlineFn) {

    markdown.use(codeinline(inlineFn))

  }



  markdown.use(mdattrs)
  markdown.use(mdcontainer, 'note', { render: notes });


  if(options?.anchors !== false) {

    const anchorOptions: mdanchor.AnchorOptions = { slugify: slug }

    if (typeof options?.anchors === 'object') {

      if(Array.isArray(options.anchors?.attrs)) {
        anchorOptions.callback = (token: Token) => {
          token.attrs.push(...(options.anchors as any).attrs)
        }
      }

      if(typeof options.anchors?.plugin === 'object') {
        Object.assign(anchorOptions, options.anchors.plugin)
      }

    }

    markdown.use(mdanchor, anchorOptions);

    eleventy.addFilter('anchor', value => `#${slug(value)}`);

  }

  markdown.use(mdcontainer, 'grid', { render: grid(markdown) });

  markdown.disable('code');

  eleventy.setLibrary('md', markdown);
  eleventy.addLiquidFilter('md', (content) => markdown.renderInline(content))



  return markdown;

}
