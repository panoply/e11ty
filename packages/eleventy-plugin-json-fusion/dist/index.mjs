var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
import marked from "marked";
import matter from "gray-matter";
import { slug } from "github-slugger";
import { join, dirname } from "node:path";
import { readFile, writeFile, access, mkdir } from "node:fs/promises";
function exists(path) {
  return __async(this, null, function* () {
    try {
      yield access(path);
      return true;
    } catch (e) {
      return false;
    }
  });
}
function write(filePath, data) {
  return __async(this, null, function* () {
    try {
      const dir = dirname(filePath);
      const exist = yield exists(dir);
      if (!exist) {
        yield mkdir(dir, { recursive: true });
      }
      yield writeFile(filePath, data);
    } catch (err) {
      throw new Error(err);
    }
  });
}
function fusion(eleventyConfig, options) {
  const opts = Object.assign({
    onContent: null,
    onHeading: null,
    onOutput: null,
    minify: false,
    output: "",
    shortCode: "search",
    codeblock: [],
    ignore: Object.assign({}, options == null ? void 0 : options.ignore),
    content: [
      "blockquote",
      "paragraph",
      "list"
    ],
    codeblocks: [
      "bash"
    ]
  }, options);
  if (!("heading" in opts.ignore)) opts.ignore.heading = [];
  if (!("syntax" in opts.ignore)) opts.ignore.syntax = [/^({{|{%|<[a-z]|:::)/g];
  let pages = [];
  let outputPath;
  const hasOutputHook = opts.onOutput !== null && typeof opts.onOutput === "function";
  const allowParagraph = opts.content.includes("paragraph");
  const allowBlockquote = opts.content.includes("blockquote");
  const allowList = opts.content.includes("list");
  const ignoreHeading = (heading) => opts.ignore.heading.some((match) => {
    return typeof match === "string" ? match === heading.toLowerCase() : match.test(heading);
  });
  const ignoreSyntax = (content) => opts.ignore.syntax.some((match) => match.test(content));
  eleventyConfig.addShortcode(opts.shortCode, FuseJson);
  eleventyConfig.on("eleventy.after", () => __async(this, null, function* () {
    if (pages.length > 0) {
      if (!outputPath) {
        throw new Error("[plugin-json-fusion] failed to obtain the output path");
      }
      let output = JSON.stringify(pages, null, opts.minify ? 0 : 2);
      if (hasOutputHook) {
        const returns = opts.onOutput(pages);
        if (Array.isArray(returns) || typeof returns === "object") {
          output = JSON.stringify(returns, null, opts.minify ? 0 : 2);
        }
      }
      yield write(outputPath, output);
      pages = [];
      outputPath = void 0;
    }
  }));
  function FuseJson(fileName) {
    return __async(this, null, function* () {
      if (!outputPath && this.page.outputPath !== false) {
        const path = dirname(this.page.outputPath);
        const output = path.replace(this.page.url.slice(0, -1), "");
        outputPath = join(process.cwd(), output, opts.output, fileName) + ".json";
      }
      const records = /* @__PURE__ */ new Map();
      const read = yield readFile(this.page.inputPath);
      const parse = marked.lexer(read.toString());
      const frontmatter = parse[0].type === "hr" ? parse.splice(0, 2).map(({ raw }) => raw).join("\n") : null;
      if (frontmatter === null) return;
      const data = matter(frontmatter).data;
      if (data.fuse === false) return;
      let heading;
      parse.forEach((token) => {
        if (token.type === "heading") {
          if (ignoreHeading(token.text)) {
            heading = void 0;
            return;
          }
          heading = token.text;
          if (!records.has(token.text)) {
            records.set(token.text, []);
          }
        } else if (records.has(heading)) {
          if (token.type === "paragraph" && allowParagraph) {
            if (ignoreSyntax(token.text)) return;
            records.get(heading).push({
              text: token.text,
              type: "paragraph"
            });
          } else if (token.type === "blockquote" && allowBlockquote) {
            if (ignoreSyntax(token.raw)) return;
            records.get(heading).push({
              text: token.raw.replace(/(^>|\n>)| \:.*(?=[^>])/g, ""),
              type: "blockquote"
            });
          } else if (token.type === "code" && opts.codeblock.includes(token.lang)) {
            records.get(heading).push({
              text: token.text,
              type: "codeblock",
              language: token.lang
            });
          } else if (token.type === "list" && allowList) {
            if (ignoreSyntax(token.raw)) return;
            records.get(heading).push({
              text: token.raw,
              type: "list"
            });
          }
        }
      });
      const page = {
        page: data.title,
        description: data.description || "",
        tags: data.tags || [],
        url: this.page.url,
        content: []
      };
      for (const heading2 of records.keys()) {
        const pathname = page.url.endsWith("/") ? page.url.slice(0, -1) : page.url;
        const cbHeading = typeof opts.onHeading === "function" ? opts.onHeading(heading2) : null;
        if (cbHeading === false) continue;
        let content = {
          heading: typeof cbHeading === "string" ? cbHeading : heading2,
          content: [],
          url: `${pathname}#${slug(heading2)}`
        };
        records.get(heading2).forEach(({ text, type, language = void 0 }) => {
          if (typeof text === "string" && text.length > 0) {
            const cbContent = typeof opts.onContent === "function" ? opts.onContent(text, type, language) : null;
            if (cbContent === false) return;
            if (language) {
              content.content.push({
                type,
                text: typeof cbContent === "string" ? cbContent : text
              });
            } else {
              content.content.push({
                type,
                text: typeof cbContent === "string" ? cbContent : text,
                language
              });
            }
          }
        });
        page.content.push(content);
      }
      if (page.content.length > 0) {
        pages.push(page);
      }
      return "";
    });
  }
}
export {
  fusion
};
