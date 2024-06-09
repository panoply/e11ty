/* eslint-disable no-unused-vars */
import type { LiteralUnion } from 'type-fest';
import type { EleventyConfig } from '11ty.ts';
import type { Options } from 'markdown-it';
import type { StaticOptions } from 'papyrus';
import papyrus from 'papyrus';
import md from 'markdown-it';
import mdcontainer from 'markdown-it-container';

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

export interface IMarkdown {
  /**
   * Exposes `syntax()` method.
   */
  syntax?: (options: CodeBlocks) => string;
  /**
   * Papyrus Language Settings
   */
  papyrus?: {
    /**
     * Default rendering options
     */
    default?: Omit<StaticOptions, 'language'>,
    /**
     * Per~Language Rendering options
     */
    language?: {
      [K in Languages]?: Omit<StaticOptions, 'language'>
    }
  };
  /**
   * Markdown IT Config
   */
  options?: Omit<Options, 'highlight'>;
}

/**
 * Prints an error to the console when an issue occurs during the
 * `highlightCode` function.
 */
function highlightError (language: Languages, error: string) {

  const SEP = '\n\n------------------------------------------------------------\n\n';

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
      return <CodeBlocks>{ language, raw, escape: () => md.utils.escapeHtml(raw) };
    } catch (err) {
      highlightError(language, err);
      return md.utils.escapeHtml(raw);
    }
  }

  return md.utils.escapeHtml(raw);

};

/**
 * Papyrus Syntax
 *
 * Highlighting code blocks of markdown annotated regions of input.
 */
function papyrusHighlight (options: IMarkdown['papyrus'], { raw, language }) {

  if (options?.language) {
    if (language in options.language) {
      return papyrus.static(raw, { language, ...options.language[language] });
    }
  }

  if (options?.default) {
    return papyrus.static(raw, { language, ...options.default });
  }

  return papyrus.static(raw, { language });

};

const grid = (md: md) => function (tokens: md.Token[], idx: number) {

  if (tokens[idx].nesting === 1) {
    const col = tokens[idx].info.trim().match(/^grid\s+(.*)$/);
    if (col !== null) return /* html */`<div class="${md.utils.escapeHtml(col[1])}">`;
  }

  return '</div>';

};

function notes (tokens: md.Token[], index: number) {

  return tokens[index].nesting === 1 ? '<blockquote class="note">' : '</blockquote>';

}

export function markdown (eleventy: EleventyConfig, options: IMarkdown) {

  const opts = Object.assign<Options, IMarkdown['options']>({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false
  }, options.options);

  const markdown = md('default', {
    ...opts,
    highlight: (string, lang) => {

      const syntax = highlightCode(markdown, string, lang);

      if (typeof syntax === 'object') {
        if (options.papyrus) {
          return papyrusHighlight(options.papyrus, syntax);
        } else if (options.syntax) {
          return options.syntax(syntax);
        }
      }

      return string;

    }
  });

  markdown.use(mdcontainer, 'note', { render: notes });
  markdown.use(mdcontainer, 'grid', { render: grid(markdown) });
  markdown.disable('code');

  eleventy.setLibrary('md', markdown);

  return markdown;

}
