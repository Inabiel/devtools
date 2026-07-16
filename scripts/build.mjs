import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const PLACEHOLDER = 'BUILD_ID_PLACEHOLDER'

// Build ID: CI env var takes priority, else timestamp.
// Prefixed with 'b' so CSS minifiers (LightningCSS) don't round large numbers.
const rawBuildNum = process.env.BUILD_NUMBER ?? String(Date.now())
const buildNum = 'b' + rawBuildNum
process.env.BUILD_NUMBER = buildNum

/** @type {Map<string, string>} filePath → original content */
const patched = new Map()

function scanAndPatch(dir) {
  const entries = readdirSync(dir, { recursive: true, encoding: 'utf8' })
  for (const entry of entries) {
    if (!entry.endsWith('.css')) continue
    const filePath = join(dir, entry)
    const code = readFileSync(filePath, 'utf8')
    if (code.includes(PLACEHOLDER)) {
      patched.set(filePath, code)
      writeFileSync(filePath, code.replaceAll(PLACEHOLDER, buildNum))
    }
  }
}

function restoreAll() {
  for (const [filePath, original] of patched) {
    writeFileSync(filePath, original)
  }
}

try {
  const label = process.env.GITHUB_RUN_NUMBER ? `CI run #${rawBuildNum}` : 'timestamp'
  console.log(`\n  📦 Build ID: ${buildNum}  (${label})\n`)

  scanAndPatch(join(root, 'src'))

  execSync('npx vite build', { stdio: 'inherit', cwd: root })
} finally {
  restoreAll()
}
