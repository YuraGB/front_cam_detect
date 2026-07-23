/* eslint parserOptions: { project: [] } */
/* eslint-disable */
// @ts-nocheck
import { readFileSync, writeFileSync } from 'node:fs'

const file = '.output/server/index.mjs'

let code = readFileSync(file, 'utf8')

const from =
  'const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));'

const to = 'const serverDir = resolve(process.cwd(), ".output/server");'

if (!code.includes(from)) {
  console.error('Pattern not found')
  process.exit(1)
}

code = code.replace(from, to)

writeFileSync(file, code)

console.log('Nitro patched')
