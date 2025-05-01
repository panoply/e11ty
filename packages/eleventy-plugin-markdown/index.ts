/* eslint-disable no-unused-vars */
import type { LiteralUnion } from 'type-fest';
import type { EleventyConfig } from '11ty.ts';
import type { Options, Token } from 'markdown-it';
import mdit from 'markdown-it';
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
   * Escapes the the inner contents of the code block
   *
   * @example
   * {
   *   highlight: {
   *    // this is a function
   *    block: ({ escape }) => escape()
   *  }
   * }
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
     * Override the default fence renderer. Use instead of `block()` function to apply
     * unique handling of codeblocks.
     */
    fence(options: CodeBlocks): string
    /**
     * Callback function for applying Syntax Highlighting within a codeblock of markdown.
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

function highlightCode (md: mdit, raw: string, language: string) {

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


interface GridToken extends Token {
  markup: string;
  map: [number, number];
  attrs: [string, string][];
}

function gridPlugin(md: mdit): void {
  // Rule to tokenize :: tags
  md.block.ruler.before('paragraph', 'grid', (
    state: mdit.StateBlock,
    startLine: number,
    endLine: number,
    silent: boolean
  ): boolean => {

    const start: number = state.bMarks[startLine] + state.tShift[startLine];
    const max: number = state.eMarks[startLine];
    const lineText: string = state.src.slice(start, max);

    // Match :: followed by optional class names
    const match = lineText.match(/^::\s+([^\s].*?)?$/);
    if (!match) return false;

    const classes: string[] = match[1] ? match[1].split(/\s+/).filter(Boolean) : [];
    const htmlTag: string = 'div'; // Always use div as the HTML tag

    if (silent) return true;

    let nextLine: number = startLine + 1;
    let contentStart: number = nextLine;
    let contentEnd: number = nextLine;
    let nestingLevel: number = 1;
    let token: GridToken;

    // Parse until closing ::
    while (nextLine < endLine && nestingLevel > 0) {
      const text: string = state.src.slice(state.bMarks[nextLine] + state.tShift[nextLine], state.eMarks[nextLine]);
      if (text.trim() === '::') {
        nestingLevel--;
        if (nestingLevel === 0) {
          contentEnd = nextLine;
          break;
        }
      } else if (text.match(/^::\s+/)) {
        nestingLevel++;
      }
      nextLine++;
    }

    if (nestingLevel !== 0) return false;

    // Create tokens for the grid container
    token = state.push('grid_open', htmlTag, 1) as GridToken;
    token.attrs = classes.length ? [['class', classes.join(' ')]] : [];
    token.markup = '::';
    token.map = [startLine, nextLine + 1];

    // Parse inner content as markdown
    if (contentStart < contentEnd) {
      const oldParentType: string = state.parentType;
      state.parentType = 'grid' as mdit.StateBlock.ParentType;
      const oldLineMax: number = state.lineMax;
      state.lineMax = contentEnd;

      state.md.block.tokenize(state, contentStart, contentEnd);

      state.parentType = oldParentType as mdit.StateBlock.ParentType;
      state.lineMax = oldLineMax;
    }

    // Closing tag
    token = state.push('grid_close', htmlTag, -1) as GridToken;
    token.markup = '::';

    state.line = nextLine + 1;
    return true;
  });

  // Render grid tokens to HTML
  md.renderer.rules.grid_open = (tokens: Token[], idx: number): string => {
    const token: GridToken = tokens[idx] as GridToken;
    const classes: string = token.attrs.find(attr => attr[0] === 'class')?.[1] || '';
    return `<${token.tag}${classes ? ` class="${classes.trim()}"` : ''}>`;
  };

  md.renderer.rules.grid_close = (tokens: Token[], idx: number): string => {
    const token: GridToken = tokens[idx] as GridToken;
    return `</${token.tag}>`;
  };
}
const blockquote: mdit.PluginSimple = (md) => {
  md.core.ruler.after('block', 'blockquote_class', (state) => {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type !== 'blockquote_open') continue;

      // Look ahead to find the inline content inside blockquote
      let j = i + 1;
      while (tokens[j] && tokens[j].type !== 'blockquote_close') {
        if (tokens[j].type === 'inline') {
          const lines = tokens[j].content.split('\n');
          const firstLine = lines[0];
          const match = firstLine.match(/^:class\s+(.*)$/);

          if (match) {
            const classNames = match[1].trim();
            token.attrJoin('class', classNames);

            // Remove the :class line
            lines.shift();
            tokens[j].content = lines.join('\n').trim();

            // Optionally remove empty wrappers if content is now empty
            if (tokens[j].content === '') {
              // remove paragraph_open/inline/paragraph_close if empty
              if (
                tokens[j - 1]?.type === 'paragraph_open' &&
                tokens[j + 1]?.type === 'paragraph_close'
              ) {
                tokens.splice(j - 1, 3);
                j -= 2;
              }
            }
          }
        }
        j++;
      }
    }
  });
};

/**
 * Renders inline code blocks
 */
const codeinline = (callback: (params: {
  raw: string;
  language: Languages
}) => string) => function (md: mdit) {


  function render (token: string) {

    const pull = token.indexOf('} ')
    const raw = token.slice(pull + 1).trimStart()
    const language = token.slice(1, pull)

    return callback({ raw, language})

  }

  function scan (state: mdit.StateBlock) {

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

export function markdown (eleventy: EleventyConfig, options: IMarkdown = { options: {} }) {

  const opts = Object.assign({ html: true, linkify: true, typographer: true, breaks: false }, options.options);
  const config: Options = { ...opts }

  const fenceFn = options?.highlight?.fence;
  const blockFn = options?.highlight?.block;

  if(fenceFn && blockFn) {
    throw new Error(
      SEP +
      'Invalid Markdown (highlight) Options\n' +
      'Cannot use the fence and block together. Must be one or the other!\n\n' +
      '- Use fence() to override the default highlight behaviour\n' +
      '- Use block() to use the the default highlight behaviour\n\n' +
      'The fence() handler allows you to return custom markup whereas block() is confined\n' +
      'to the <pre> tag structure.'
    )
  }

  if(blockFn) {
    config.highlight = (string, language) => {
      const syntax = highlightCode(md, string, language);
      if (typeof syntax === 'object') return blockFn(syntax);
      return string;
    }
  }

  const inlineFn = options?.highlight?.inline;
  const md = mdit('default', config);

  if(fenceFn) {
    md.renderer.rules.fence = function (tokens, idx) {
      const token = tokens[idx];
      const raw = token.content; // Raw code content
      const language = token.info.trim(); // Language from ```lang
      const syntax = highlightCode(md, raw, language)
      return typeof syntax === 'object' ? fenceFn(syntax) : md.utils.escapeHtml(raw);
    };
  }

  if(inlineFn) {
    md.use(codeinline(inlineFn))
  }



  md.use(mdattrs)
  md.use(blockquote)
  md.use(gridPlugin)


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

    md.use(mdanchor, anchorOptions);

    eleventy.addFilter('anchor', value => `#${slug(value)}`);

  }


  md.disable('code');

  eleventy.setLibrary('md', md);
  eleventy.addLiquidFilter('md', (content) => md.renderInline(content))



  return markdown;

}
