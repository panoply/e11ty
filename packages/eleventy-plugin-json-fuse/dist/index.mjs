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
function fuse(eleventyConfig, config) {
  const options = Object.assign({
    onText: null,
    onHeading: null,
    minify: false,
    contentTypes: ["blockquote", "paragraph", "list", "codeblock"],
    headingIgnores: [],
    output: "",
    shortCode: "search",
    syntaxIgnores: /^({{|{%|<[a-z]|:::)/g
  }, config);
  let pages = [];
  let outputPath;
  eleventyConfig.addShortcode(options.shortCode, FuseJson);
  eleventyConfig.on("eleventy.after", () => __async(this, null, function* () {
    if (pages.length > 0) {
      if (!outputPath) {
        throw Error("[plugin-json-fuse] failed to obtain the output path");
      }
      const content = JSON.stringify(pages, null, options.minify ? 0 : 2);
      yield write(outputPath, content);
      pages = [];
      outputPath = void 0;
    }
  }));
  const allowParagraph = options.contentTypes.includes("paragraph");
  const allowBlockquote = options.contentTypes.includes("blockquote");
  const allowCodeblock = options.contentTypes.includes("blockquote");
  const allowList = options.contentTypes.includes("list");
  function FuseJson(fileName) {
    return __async(this, null, function* () {
      if (!outputPath && this.page.outputPath !== false) {
        const path = dirname(this.page.outputPath);
        const output = path.replace(this.page.url.slice(0, -1), "");
        outputPath = join(process.cwd(), output, options.output, fileName) + ".json";
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
          if (options.headingIgnores.includes(token.text)) {
            heading = void 0;
            return;
          }
          heading = token.text;
          if (!records.has(token.text)) {
            records.set(token.text, []);
          }
        } else if (records.has(heading)) {
          if (token.type === "paragraph" && allowParagraph) {
            if (options.syntaxIgnores.test(token.text)) return;
            records.get(heading).push({
              text: token.text,
              type: "paragraph"
            });
          } else if (token.type === "blockquote" && allowBlockquote) {
            records.get(heading).push({
              text: token.raw.replace(/^>|\n>/g, ""),
              type: "blockquote"
            });
          } else if (token.type === "code" && allowCodeblock) {
            if (records.has(heading)) {
              records.get(heading).push({
                text: token.text,
                type: "codeblock",
                language: token.lang
              });
            }
          } else if (token.type === "list" && allowList) {
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
        const cbHeading = typeof options.onHeading === "function" ? options.onHeading(heading2) : null;
        if (cbHeading === false) continue;
        let content = {
          heading: typeof cbHeading === "string" ? cbHeading : heading2,
          text: "",
          type: "paragraph",
          url: `${pathname}#${slug(heading2)}`,
          language: void 0
        };
        records.get(heading2).forEach(({ text, type, language }) => {
          if (typeof text === "string" && text.length > 0) {
            const cbText = typeof options.onText === "function" ? options.onText(text, type, language) : null;
            if (cbText === false) return;
            content.text += typeof cbText === "string" ? cbText : heading2;
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
  fuse
};
