// Node module-resolution hook used only by the pure-logic test runner
// (scripts/run-pure-tests.mjs). Production code (Metro/Expo bundler) never
// loads this file and is unaffected by it.
//
// Vela's source files import sibling modules the normal TypeScript/bundler
// way — no file extension (`from '../constants/config'`). That's correct
// for Metro, but Node's native ESM loader requires an explicit extension on
// relative specifiers. Rather than adding `.ts` extensions to production
// import statements (which would be a real, app-wide source change made
// solely to satisfy a test runner), this hook retries a failed relative
// resolution with common TS extensions appended, so the existing source
// stays untouched.
const EXTENSION_CANDIDATES = ['.ts', '.tsx', '/index.ts', '/index.tsx']

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (err) {
    const isRelative = specifier.startsWith('.') || specifier.startsWith('/')
    if (err?.code !== 'ERR_MODULE_NOT_FOUND' || !isRelative) throw err

    for (const ext of EXTENSION_CANDIDATES) {
      try {
        return await nextResolve(specifier + ext, context)
      } catch {
        // try the next candidate extension
      }
    }
    throw err
  }
}
