// Runs one pure-logic test file (given as argv[1]) under Node's native
// TypeScript type-stripping, with the sibling resolve-ts-imports.mjs hook
// registered so extensionless relative imports inside the source files
// under test (Metro-style, e.g. `from '../constants/config'`) resolve the
// same way Node's ESM loader resolves everything else. Zero new
// dependencies — `node:module#register` is a stable Node API.
//
// Usage: node --experimental-strip-types scripts/run-pure-tests.mjs <test-file.ts>
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./resolve-ts-imports.mjs', import.meta.url)

const target = process.argv[2]
if (!target) {
  console.error('Usage: node --experimental-strip-types scripts/run-pure-tests.mjs <test-file.ts>')
  process.exit(1)
}

await import(pathToFileURL(target).href)
