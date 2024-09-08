function task() {
  echo ""
  echo "\033[0;36m--------------------------------------------------------\033[0m"
  echo "\033[0;36m\033[1mBUILDING $1\033[0m\033[0m ~ \033[0;90m$2\033[0m"
  echo "\033[0;36m--------------------------------------------------------\033[0m"
}

# TYPINGS
task TYPES 11ty.ts
pnpm @11ty build

# HTML TERSER
task PLUGIN @e11ty/eleventy-plugin-html-terser
pnpm @terser build

# MARKDOWN
task PLUGIN @e11ty/eleventy-plugin-markdown
pnpm @markdown build

# SVG SPRITE
task PLUGIN @e11ty/eleventy-plugin-svg-sprite
pnpm @sprite build

# FUSE
task PLUGIN @e11ty/eleventy-plugin-json-fuse
pnpm @fuse build

# E11TY
task PLUGIN e11ty
pnpm @e11ty build
