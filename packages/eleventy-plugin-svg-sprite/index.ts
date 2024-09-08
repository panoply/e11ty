import type { EleventyConfig } from '11ty.ts';
import glob from 'fast-glob';
import { statSync, readFileSync } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import SVGSpriter from 'svg-sprite';
import Vinyl from 'vinyl';
import merge from 'mergerino';

export interface ISVGSprite {
  /**
   * Relative path to svg directory
   */
  inputPath: string;
  /**
   * The output path of the SVG Sprite
   */
  outputPath?: string;
  /**
   * Applied to all embedded occurances
   *
   * ```liquid
   * {% svg 'icon-name', 'global-class custom-class' %}
   * ```
   *
   * @default ''
   */
  globalClass?: string;
  /**
   * Applied to all embedded occurances
   *
   * ```liquid
   * {% svg 'icon-name', 'global-class default-class' %}
   * ```
   *
   * @default ''
   */
  defaultClass?: string;
  /**
   * The Sprite shortcode
   *
   * ```liquid
   * {% sprite %}
   * ```
   *
   * @default 'sprite'
   */
  spriteShortCode: string;
  /**
   * The embedded SVG shortcode
   *
   * ```liquid
   * {% svg 'icon-name', 'custom-class' %}
   * ```
   */
  svgShortCode: string;
  /**
   * [SVG Sprite](https://github.com/svg-sprite/svg-sprite) Options
   */
  spriteConfig: SVGSpriter.Config
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

function SVGSprite (config: ISVGSprite) {

  const cache: { [key: string]: { cacheKey: string; spriteContent?: string; } } = Object.create(null);
  const cwd = resolve(config.inputPath);
  const output = config.outputPath ? resolve(config.outputPath) : null;
  const { spriteShortCode, spriteConfig, inputPath } = config;

  async function compile () {

    const files = await glob('**/*.svg', { cwd });
    const cacheKey = files.map(file => `${file}:${statSync(join(cwd, file)).mtimeMs}`).join('|');

    // Note: Replace custom file watching with chokidar if there are bugs/limitations.
    // https://github.com/paulmillr/chokidar
    // https://stackoverflow.com/a/13705878

    if (spriteShortCode in cache) {
      if (cache[spriteShortCode].cacheKey === cacheKey) return cache[spriteShortCode].spriteContent;
      cache[spriteShortCode].cacheKey = cacheKey;
    } else {
      cache[spriteShortCode] = { cacheKey };
    }

    // Make a new SVGSpriter instance w/ configuration
    const spriter = new SVGSpriter(spriteConfig);

    // Add them all to the spriter
    files.forEach((file) => {

      const path = join(cwd, file);
      const vinyl = new Vinyl({
        path: join(cwd, file),
        base: cwd,
        contents: readFileSync(path)
      });

      spriter.add(vinyl);

    });

    async function compileSprite (opts: any): Promise<{ contents: Buffer }> {

      return new Promise((resolve, reject) => {
        return spriter.compile(opts, (error, result) => {
          if (error) return reject(error);
          resolve(result.symbol.sprite);
        });
      });

    };

    // Compile the sprite file and return it as a string
    const sprite = await compileSprite(spriteConfig.mode);

    if (output) {
      console.info(`[svg-sprite] Writing ${output} from ${inputPath}`);
      await write(output, sprite.contents.toString('utf8'));
    }

    // cache spriteContent into global spriteCache variable
    cache[spriteShortCode].spriteContent = [
      '<div style="width: 0; height: 0; position: absolute; overflow: hidden;">',
      sprite.contents.toString('utf8'),
      '</div>'
    ].join('');
  };

  return {
    compile,
    getSprite: (code = spriteShortCode) => cache[code].spriteContent
  };

}

let idCounter = 0;

export function sprite (eleventyConfig: EleventyConfig, pluginConfig: ISVGSprite | ISVGSprite[]) {

  if (!pluginConfig) return;
  if (!Array.isArray(pluginConfig)) pluginConfig = [ pluginConfig ];

  const svgSpriteShortcodeList: string[] = [];

  for (const options of pluginConfig) {

    if (!options.inputPath) {
      throw new Error('[svg-sprite] inputPath must be specified in plugin options');
    }

    const config = merge({
      inputPath: '',
      outputPath: '',
      globalClass: '',
      defaultClass: '',
      spriteShortCode: 'sprite',
      svgShortCode: 'svg',
      spriteConfig: {
        mode: {
          symbol: {
            inline: true,
            sprite: 'sprite.svg',
            example: false
          }
        },
        shape: {
          transform: [ 'svgo' ],
          id: {
            generator: 'svg-%s'
          }
        },
        svg: {
          xmlDeclaration: false,
          doctypeDeclaration: false
        }
      }
    }, options as any);

    if (svgSpriteShortcodeList.includes(config.spriteShortCode)) {
      throw new Error('[svg-sprite] illegal to have duplicate svgSpriteShortcode in config list');
    }

    svgSpriteShortcodeList.push(config.spriteShortCode);

    const svgSpriteInstance = SVGSprite(config);

    eleventyConfig.on('eleventy.before', async () => {
      await svgSpriteInstance.compile();
    });

    eleventyConfig.addShortcode(config.spriteShortCode, () => {
      return svgSpriteInstance.getSprite(config.spriteShortCode) || '';
    });

    eleventyConfig.addShortcode(config.svgShortCode, (name, classes, desc) => {

      if (!name) {
        throw new Error('[svg-sprite] name of SVG must be specified');
      }

      const nameAttr = name;
      const classesAttr = `${config.globalClass} ${classes || config.defaultClass}`;
      const descAttr = desc || `${nameAttr} icon`;
      const uniqueID = (idCounter++).toString(36);

      return [
        `<svg class="${classesAttr}" aria-labelledby="symbol-${nameAttr}-desc-${uniqueID}" role="group">`,
        `<desc id="symbol-${nameAttr}-desc-${uniqueID}">${descAttr}</desc>`,
        `<use xlink:href="#svg-${nameAttr}"></use>`,
        '</svg>'
      ].join('');

    });
  }
};
