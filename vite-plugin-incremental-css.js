import fs from 'node:fs'
import path from 'node:path'

/**
 * Vite plugin that maintains an incrementing build counter and stamps it into
 * output CSS via a `:root{--build:N}` custom property. Because the CSS content
 * changes each build, Vite's built-in content hashing produces a unique filename —
 * giving you effective cache busting without manual filename manipulation.
 *
 * Counter is persisted in `.build-counter` at the project root.
 *
 * @param {{ counterFile?: string, root?: string }} opts
 * @returns {import('vite').Plugin}
 */
export function incrementalCss(opts = {}) {
  const counterFile = opts.counterFile ?? '.build-counter'
  const root = opts.root ?? process.cwd()
  const counterPath = path.resolve(root, counterFile)

  let buildNum

  return {
    name: 'incremental-css',
    enforce: 'pre',
    apply: 'build',

    buildStart() {
      let current = 0
      try {
        current = parseInt(fs.readFileSync(counterPath, 'utf8'), 10) || 0
      } catch {
        // File doesn't exist yet — start at 0
      }
      buildNum = current + 1
      fs.writeFileSync(counterPath, String(buildNum))
      console.log(`\n  📦 [incremental-css] Build #${buildNum}\n`)
    },

    transform(code, id) {
      if (id.endsWith('.css')) {
        return `:root{--build:${buildNum}}` + code
      }
    },
  }
}
