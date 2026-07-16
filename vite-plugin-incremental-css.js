/**
 * Vite plugin that stamps a unique build identifier into output CSS via a
 * `--build` custom property. The actual patching is handled by the prebuild
 * script (`scripts/build.mjs`), which replaces `BUILD_ID_PLACEHOLDER` on disk
 * before Vite reads the files.
 *
 * Because the CSS content changes each build, Vite's built-in content hashing
 * produces a unique filename — giving effective cache busting.
 *
 * Build ID is passed via BUILD_NUMBER env var (prefixed with 'b' to prevent
 * CSS minifiers from rounding large numeric values).
 *
 * @returns {import('vite').Plugin}
 */
export function incrementalCss() {
  return {
    name: 'incremental-css',
    enforce: 'pre',
    apply: 'build',

    buildStart() {
      if (process.env.BUILD_NUMBER) {
        console.log(`\n  📦 [incremental-css] Build #${process.env.BUILD_NUMBER}\n`)
      }
    },
  }
}
